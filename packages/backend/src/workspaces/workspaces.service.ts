import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class WorkspacesService {
  constructor(private readonly prisma: PrismaService) {}

  /** 본인이 속한 워크스페이스 목록 */
  async listMine(userId: string) {
    return this.prisma.workspace.findMany({
      where: {
        archivedAt: null,
        members: { some: { userId } },
      },
      include: {
        _count: { select: { members: true, invoices: true } },
        members: {
          where: { userId },
          select: { role: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async create(userId: string, input: { name: string; bizRegNo?: string; plan?: string }) {
    return this.prisma.workspace.create({
      data: {
        name: input.name,
        bizRegNo: input.bizRegNo ?? null,
        plan: input.plan ?? "team",
        members: {
          create: { userId, role: "owner" },
        },
      },
    });
  }

  async listMembers(userId: string, workspaceId: string) {
    await this.requireRole(userId, workspaceId, ["owner", "admin", "member"]);
    return this.prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: { id: true, nickname: true, email: true, avatarUrl: true },
        },
      },
      orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
    });
  }

  /**
   * 멤버 추가는 이메일 기반 — 가입한 사용자만 가능. 미가입자는 일반 가입
   * 후 다시 시도하도록. 좌석 한도 체크.
   */
  async addMember(userId: string, workspaceId: string, email: string, role = "member") {
    await this.requireRole(userId, workspaceId, ["owner", "admin"]);
    const ws = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { _count: { select: { members: true } } },
    });
    if (!ws) throw new NotFoundException();
    if (ws._count.members >= ws.seats) {
      throw new ForbiddenException(
        `좌석 한도(${ws.seats}석) 초과. 플랜을 업그레이드하거나 좌석을 늘려 주세요.`,
      );
    }
    const target = await this.prisma.user.findUnique({ where: { email } });
    if (!target) {
      throw new NotFoundException(
        "해당 이메일로 가입된 사용자를 찾을 수 없습니다. 가입 후 다시 시도해 주세요.",
      );
    }
    return this.prisma.workspaceMember.upsert({
      where: { workspaceId_userId: { workspaceId, userId: target.id } },
      update: { role },
      create: { workspaceId, userId: target.id, role },
    });
  }

  async removeMember(userId: string, workspaceId: string, memberId: string) {
    await this.requireRole(userId, workspaceId, ["owner"]);
    return this.prisma.workspaceMember.delete({ where: { id: memberId } });
  }

  async listInvoices(userId: string, workspaceId: string) {
    await this.requireRole(userId, workspaceId, ["owner", "admin"]);
    return this.prisma.workspaceInvoice.findMany({
      where: { workspaceId },
      orderBy: { issuedAt: "desc" },
    });
  }

  private async requireRole(
    userId: string,
    workspaceId: string,
    allowed: ("owner" | "admin" | "member")[],
  ) {
    const member = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
    if (!member) throw new NotFoundException("워크스페이스를 찾을 수 없습니다");
    if (!allowed.includes(member.role as "owner" | "admin" | "member")) {
      throw new ForbiddenException("권한이 없습니다");
    }
  }
}
