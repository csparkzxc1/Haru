import { Controller, Get, UseGuards } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CurrentUser, JwtAuthGuard } from "../auth/jwt-auth.guard";
import type { AuthenticatedUser } from "../auth/jwt.strategy";
import { isHoliday } from "@haru/shared/korean-calendar";

/**
 * 홈 위젯이 호출하는 가벼운 read-only 엔드포인트.
 *
 * 위젯은 OS 단에서 분 단위 polling 만 가능하므로 응답을 작게 유지하고
 * cache-friendly 한 형식으로 반환한다.
 *
 *  /api/widgets/today    : 오늘의 핵심 (제목/시각/총개수/완료개수)
 *  /api/widgets/dday     : 임박 마감 3건
 */
@Controller("widgets")
@UseGuards(JwtAuthGuard)
export class WidgetsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("today")
  async today(@CurrentUser() user: AuthenticatedUser) {
    const start = startOfDay();
    const end = addDays(start, 1);

    const tasks = await this.prisma.task.findMany({
      where: {
        ownerId: user.id,
        deletedAt: null,
        when: { gte: start, lt: end },
      },
      orderBy: { when: "asc" },
      take: 5,
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

    const holiday = isHoliday(new Date());
    return {
      date: start.toISOString().slice(0, 10),
      holiday: holiday?.name ?? null,
      total,
      done,
      progress: total === 0 ? 0 : Math.round((done / total) * 100),
      preview: tasks,
    };
  }

  @Get("dday")
  async dday(@CurrentUser() user: AuthenticatedUser) {
    const now = new Date();
    const tasks = await this.prisma.task.findMany({
      where: {
        ownerId: user.id,
        deletedAt: null,
        status: "OPEN",
        deadline: { not: null, gte: now },
      },
      orderBy: { deadline: "asc" },
      take: 3,
      select: { id: true, title: true, deadline: true },
    });
    return tasks.map((t) => ({
      id: t.id,
      title: t.title,
      deadline: t.deadline,
      daysLeft: Math.ceil((t.deadline!.getTime() - now.getTime()) / 86_400_000),
    }));
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
