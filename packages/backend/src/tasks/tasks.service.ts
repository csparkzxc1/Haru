import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { Prisma, TaskStatus } from "@prisma/client";
import type { CreateTaskDto, UpdateTaskDto, ListTasksQuery } from "./tasks.dto";

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async list(ownerId: string, query: ListTasksQuery) {
    const where: Prisma.TaskWhereInput = { ownerId };

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

  async get(ownerId: string, id: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, ownerId },
      include: { checklistItems: true, taskTags: { include: { tag: true } } },
    });
    if (!task) throw new NotFoundException("Task not found");
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

  async update(ownerId: string, id: string, dto: UpdateTaskDto) {
    await this.get(ownerId, id);
    const { tags, ...rest } = dto;
    return this.prisma.task.update({
      where: { id },
      data: {
        ...rest,
        taskTags: tags ? await this.resetTags(ownerId, id, tags) : undefined,
      },
      include: { checklistItems: true, taskTags: { include: { tag: true } } },
    });
  }

  async complete(ownerId: string, id: string) {
    await this.get(ownerId, id);
    return this.prisma.task.update({
      where: { id },
      data: { status: "COMPLETED", completedAt: new Date() },
    });
  }

  async remove(ownerId: string, id: string) {
    await this.get(ownerId, id);
    await this.prisma.task.delete({ where: { id } });
    return { ok: true };
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
