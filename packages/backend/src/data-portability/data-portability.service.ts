import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

/**
 * 개인정보보호법 제35조(개인정보 열람권), 제36조(정정·삭제) 대응.
 *
 *   - exportAll(userId): 사용자의 모든 식별/콘텐츠 데이터를 단일 JSON 으로
 *     반환. 다운로드 한 번으로 이전·백업 가능.
 *   - deleteAccount(userId): 소프트 삭제. User.deletedAt 마킹 + 모든 세션 폐기.
 *     실제 파기는 7일 후 cron 으로 (사용자 변심 대응 + 법령상 보관 의무
 *     항목 별도 보관). v1 단계는 마킹까지만.
 */
@Injectable()
export class DataPortabilityService {
  private readonly logger = new Logger(DataPortabilityService.name);

  constructor(private readonly prisma: PrismaService) {}

  async exportAll(userId: string) {
    const [
      user,
      socials,
      areas,
      memberships,
      projects,
      tasks,
      tags,
      familyEvents,
      sessions,
      pushTokens,
      auditLogs,
    ] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          nickname: true,
          timezone: true,
          locale: true,
          plan: true,
          marketingOptIn: true,
          marketingOptInAt: true,
          privacyAgreedAt: true,
          termsAgreedAt: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.socialAccount.findMany({
        where: { userId },
        select: { provider: true, providerId: true, createdAt: true },
      }),
      this.prisma.area.findMany({ where: { ownerId: userId } }),
      this.prisma.areaMember.findMany({
        where: { userId },
        include: {
          area: { select: { id: true, title: true, ownerId: true } },
        },
      }),
      this.prisma.project.findMany({ where: { ownerId: userId } }),
      this.prisma.task.findMany({
        where: { ownerId: userId },
        include: {
          checklistItems: true,
          taskTags: { include: { tag: { select: { name: true } } } },
        },
      }),
      this.prisma.tag.findMany({ where: { ownerId: userId } }),
      this.prisma.familyEvent.findMany({ where: { ownerId: userId } }),
      this.prisma.session.findMany({
        where: { userId },
        select: {
          id: true,
          deviceLabel: true,
          ipAddress: true,
          userAgent: true,
          createdAt: true,
          expiresAt: true,
          revokedAt: true,
        },
      }),
      this.prisma.pushToken.findMany({
        where: { userId },
        select: {
          platform: true,
          deviceLabel: true,
          createdAt: true,
          lastUsedAt: true,
        },
      }),
      this.prisma.auditLog.findMany({
        where: { actorId: userId },
        orderBy: { createdAt: "desc" },
        take: 1000,
      }),
    ]);

    return {
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      user,
      socials,
      areas,
      memberships,
      projects,
      tasks,
      tags,
      familyEvents,
      sessions,
      pushTokens,
      auditLogs,
    };
  }

  async deleteAccount(userId: string) {
    const now = new Date();
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { deletedAt: now },
      });
      // 모든 활성 세션 즉시 폐기 → 다른 기기에서 자동 로그아웃.
      await tx.session.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: now },
      });
      await tx.pushToken.deleteMany({ where: { userId } });
      await tx.auditLog.create({
        data: {
          actorId: userId,
          action: "account.delete",
          resource: `user:${userId}`,
          details: { softDelete: true },
        },
      });
    });
    this.logger.log(`[gdpr] account soft-deleted: ${userId}`);
    return { ok: true, scheduledFor: addDays(now, 7).toISOString() };
  }
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
