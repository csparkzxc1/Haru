import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { randomBytes } from "node:crypto";
import { PrismaService } from "../prisma/prisma.service";
import type { CreateAreaDto, UpdateAreaDto } from "./areas.dto";

@Injectable()
export class AreasService {
  constructor(private readonly prisma: PrismaService) {}

  /** 본인 소유 영역 + 공유받은 영역 */
  async list(userId: string) {
    const owned = await this.prisma.area.findMany({
      where: { ownerId: userId, archivedAt: null },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: {
        _count: { select: { projects: true, tasks: true, members: true } },
        members: { where: { joinedAt: { not: null } }, take: 5 },
      },
    });
    const shared = await this.prisma.area.findMany({
      where: {
        archivedAt: null,
        members: { some: { userId, joinedAt: { not: null } } },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: {
        _count: { select: { projects: true, tasks: true, members: true } },
        members: { where: { joinedAt: { not: null } }, take: 5 },
      },
    });
    return [...owned, ...shared];
  }

  create(ownerId: string, dto: CreateAreaDto) {
    return this.prisma.area.create({ data: { ...dto, ownerId } });
  }

  async update(userId: string, id: string, dto: UpdateAreaDto) {
    await this.requireOwnerOr(userId, id, ["owner", "member"]);
    return this.prisma.area.update({ where: { id }, data: dto });
  }

  async archive(userId: string, id: string) {
    await this.requireOwnerOr(userId, id, ["owner"]);
    return this.prisma.area.update({
      where: { id },
      data: { archivedAt: new Date() },
    });
  }

  /** 초대 토큰 발급. 7일 유효, URL-safe. */
  async createInvite(userId: string, areaId: string) {
    await this.requireOwnerOr(userId, areaId, ["owner"]);
    const token = randomBytes(24).toString("base64url");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const invite = await this.prisma.areaInvite.create({
      data: { areaId, token, invitedBy: userId, expiresAt },
    });
    const area = await this.prisma.area.findUnique({ where: { id: areaId } });
    return {
      token: invite.token,
      expiresAt: invite.expiresAt,
      areaTitle: area?.title,
    };
  }

  /** 토큰으로 멤버 합류. 본인이 이미 멤버이면 멱등. */
  async acceptInvite(userId: string, token: string) {
    const invite = await this.prisma.areaInvite.findUnique({
      where: { token },
    });
    if (!invite) throw new NotFoundException("유효하지 않은 초대 코드입니다");
    if (invite.acceptedAt) {
      throw new ForbiddenException("이미 사용된 초대 코드입니다");
    }
    if (invite.expiresAt < new Date()) {
      throw new ForbiddenException("만료된 초대 코드입니다");
    }
    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      await tx.areaInvite.update({
        where: { id: invite.id },
        data: { acceptedAt: now, acceptedBy: userId },
      });
      const member = await tx.areaMember.upsert({
        where: { areaId_userId: { areaId: invite.areaId, userId } },
        update: { joinedAt: now },
        create: {
          areaId: invite.areaId,
          userId,
          role: "member",
          joinedAt: now,
        },
      });
      // 영역에 1명 이상 합류 시 공유 영역으로 마킹
      await tx.area.update({
        where: { id: invite.areaId },
        data: { shared: true },
      });
      return member;
    });
  }

  async listMembers(userId: string, areaId: string) {
    await this.requireOwnerOr(userId, areaId, ["owner", "member"]);
    return this.prisma.areaMember.findMany({
      where: { areaId },
      include: {
        user: { select: { id: true, nickname: true, email: true, avatarUrl: true } },
      },
      orderBy: [{ role: "asc" }, { invitedAt: "asc" }],
    });
  }

  async removeMember(userId: string, areaId: string, memberId: string) {
    await this.requireOwnerOr(userId, areaId, ["owner"]);
    return this.prisma.areaMember.delete({ where: { id: memberId } });
  }

  /**
   * 사용자가 해당 영역에 권한이 있는지 확인. 없으면 ForbiddenException.
   * allowed: ["owner"] 만 통과시킬지, ["owner","member"] 모두 허용할지.
   */
  private async requireOwnerOr(
    userId: string,
    areaId: string,
    allowed: ("owner" | "member" | "viewer")[],
  ) {
    const area = await this.prisma.area.findUnique({
      where: { id: areaId },
      include: { members: { where: { userId, joinedAt: { not: null } } } },
    });
    if (!area) throw new NotFoundException("영역을 찾을 수 없습니다");

    if (area.ownerId === userId && allowed.includes("owner")) return;

    const member = area.members[0];
    if (member && allowed.includes(member.role as "owner" | "member" | "viewer")) {
      return;
    }
    throw new ForbiddenException("이 영역에 접근할 권한이 없습니다");
  }
}
