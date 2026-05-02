import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { Prisma, TaskStatus } from "@prisma/client";
import type { CreateTaskDto, UpdateTaskDto, ListTasksQuery } from "./tasks.dto";

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, query: ListTasksQuery) {
    // 본인 소유 + 공유받은 영역의 task 모두 조회
    const sharedAreaIds = await this.sharedAreaIdsFor(userId);
    const where: Prisma.TaskWhereInput = {
      deletedAt: null,
      OR: [
        { ownerId: userId },
        ...(sharedAreaIds.length > 0
          ? [{ areaId: { in: sharedAreaIds } } as Prisma.TaskWhereInput]
          : []),
      ],
    };

    switch (query.view) {
      case "today": {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        where.status = "OPEN";
        where.when = { gte: start, lt: end };
        break;
      }
      case "thisWeek": {
        const now = new Date();
        const dow = now.getDay();
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dow);
        const end = new Date(start);
        end.setDate(end.getDate() + 7);
        where.status = "OPEN";
        where.when = { gte: start, lt: end };
        break;
      }
      case "upcoming": {
        const tomorrow = new Date();
        tomorrow.setHours(0, 0, 0, 0);
        tomorrow.setDate(tomorrow.getDate() + 1);
        where.status = "OPEN";
        where.when = { gte: tomorrow };
        break;
      }
      case "anytime":
        where.status = "OPEN";
        where.when = null;
        break;
      case "someday":
        where.status = "OPEN";
        where.when = null;
        // Someday = 의도적으로 보류된 항목 — v1에선 태그 '#someday'로 구분
        break;
      case "logbook":
        where.status = { in: ["COMPLETED", "CANCELED"] satisfies TaskStatus[] };
        break;
      case "inbox":
      default:
        where.status = "OPEN";
        where.projectId = null;
        where.areaId = null;
        break;
    }

    if (query.projectId) where.projectId = query.projectId;
    if (query.areaId) where.areaId = query.areaId;

    return this.prisma.task.findMany({
      where,
      include: { checklistItems: true, taskTags: { include: { tag: true } } },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: query.limit ?? 200,
    });
  }

  async get(userId: string, id: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, deletedAt: null },
      include: { checklistItems: true, taskTags: { include: { tag: true } } },
    });
    if (!task) throw new NotFoundException("Task not found");
    await this.assertCanAccess(userId, task.ownerId, task.areaId);
    return task;
  }

  async create(ownerId: string, dto: CreateTaskDto) {
    const { tags, checklist, ...rest } = dto;
    return this.prisma.task.create({
      data: {
        ...rest,
        ownerId,
        checklistItems: checklist ? { create: checklist.map((c, i) => ({ title: c, sortOrder: i })) } : undefined,
        taskTags: tags ? await this.connectOrCreateTags(ownerId, tags) : undefined,
      },
      include: { checklistItems: true, taskTags: { include: { tag: true } } },
    });
  }

  async update(userId: string, id: string, dto: UpdateTaskDto) {
    const task = await this.get(userId, id);
    const { tags, ...rest } = dto;
    return this.prisma.task.update({
      where: { id },
      data: {
        ...rest,
        version: { increment: 1 },
        taskTags: tags ? await this.resetTags(task.ownerId, id, tags) : undefined,
      },
      include: { checklistItems: true, taskTags: { include: { tag: true } } },
    });
  }

  async complete(userId: string, id: string) {
    await this.get(userId, id);
    return this.prisma.task.update({
      where: { id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        version: { increment: 1 },
      },
    });
  }

  /** 소프트 삭제. 다른 기기가 sync/pull 로 삭제 이벤트를 받을 수 있도록. */
  async remove(userId: string, id: string) {
    await this.get(userId, id);
    await this.prisma.task.update({
      where: { id },
      data: { deletedAt: new Date(), version: { increment: 1 } },
    });
    return { ok: true };
  }

  private async sharedAreaIdsFor(userId: string): Promise<string[]> {
    const rows = await this.prisma.areaMember.findMany({
      where: { userId, joinedAt: { not: null } },
      select: { areaId: true },
    });
    return rows.map((r) => r.areaId);
  }

  private async assertCanAccess(
    userId: string,
    ownerId: string,
    areaId: string | null,
  ) {
    if (ownerId === userId) return;
    if (!areaId) throw new ForbiddenException("권한이 없습니다");
    const member = await this.prisma.areaMember.findUnique({
      where: { areaId_userId: { areaId, userId } },
    });
    if (!member || !member.joinedAt) {
      throw new ForbiddenException("권한이 없습니다");
    }
  }

  private async connectOrCreateTags(ownerId: string, names: string[]) {
    const tags = await Promise.all(
      names.map((name) =>
        this.prisma.tag.upsert({
          where: { ownerId_name: { ownerId, name } },
          update: {},
          create: { ownerId, name },
        }),
      ),
    );
    return { create: tags.map((t) => ({ tagId: t.id })) };
  }

  private async resetTags(ownerId: string, taskId: string, names: string[]) {
    await this.prisma.taskTag.deleteMany({ where: { taskId } });
    return this.connectOrCreateTags(ownerId, names);
  }
}
