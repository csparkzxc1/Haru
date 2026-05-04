import { Controller, Get, Post, Body, UseGuards } from "@nestjs/common";
import { IsUUID } from "class-validator";
import { PrismaService } from "../prisma/prisma.service";
import { CurrentUser, JwtAuthGuard } from "../auth/jwt-auth.guard";
import type { AuthenticatedUser } from "../auth/jwt.strategy";

class CompleteDto {
  @IsUUID() id!: string;
}

/**
 * Apple Watch · Wear OS 전용 초경량 endpoint.
 *
 * 워치는 배터리·대역폭이 매우 제한적이므로 응답을 작게 유지한다.
 *
 *   GET  /api/watch/today      → ≤ 1KB. 오늘의 task 3개 + 진행률.
 *   POST /api/watch/complete   → 단일 task 완료. 반환은 OK 만.
 *
 * 워치 OS는 보통 30분~1시간 단위 background refresh 만 허용 → over-fetch
 * 방지 위해 데이터를 최소화하고 연관 객체(taskTags 등)는 제외.
 */
@Controller("watch")
@UseGuards(JwtAuthGuard)
export class WatchController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("today")
  async today(@CurrentUser() user: AuthenticatedUser) {
    const start = startOfDay();
    const end = addDays(start, 1);

    const tasks = await this.prisma.task.findMany({
      where: {
        ownerId: user.id,
        deletedAt: null,
        OR: [
          { when: { gte: start, lt: end } },
          { deadline: { gte: start, lt: end } },
        ],
      },
      orderBy: { when: "asc" },
      take: 3,
      select: { id: true, title: true, when: true, status: true },
    });

    const total = await this.prisma.task.count({
      where: {
        ownerId: user.id,
        deletedAt: null,
        when: { gte: start, lt: end },
      },
    });
    const done = await this.prisma.task.count({
      where: {
        ownerId: user.id,
        deletedAt: null,
        when: { gte: start, lt: end },
        status: "COMPLETED",
      },
    });

    return {
      // 단축 키 — 워치 페이로드 줄이기 위함
      d: start.toISOString().slice(0, 10), // date
      n: total, // total
      c: done, // completed
      // 미완료 task 만 워치에 노출 (체크 가능한 것만)
      t: tasks
        .filter((t) => t.status === "OPEN")
        .map((t) => ({
          i: t.id,
          x: t.title.length > 40 ? t.title.slice(0, 39) + "…" : t.title,
          h: t.when ? new Date(t.when).getHours() : null,
          m: t.when ? new Date(t.when).getMinutes() : null,
        })),
    };
  }

  @Post("complete")
  async complete(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CompleteDto,
  ) {
    // 권한 체크 후 update — service 거치지 않고 인라인 처리 (latency 절감)
    const task = await this.prisma.task.findFirst({
      where: { id: dto.id, ownerId: user.id, deletedAt: null },
      select: { id: true },
    });
    if (!task) return { ok: false };
    await this.prisma.task.update({
      where: { id: task.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        version: { increment: 1 },
      },
    });
    return { ok: true };
  }
}

function startOfDay(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
