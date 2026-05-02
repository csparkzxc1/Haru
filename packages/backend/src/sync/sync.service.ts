import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { resolveConflict } from "@haru/shared/sync-conflict";
import type { TaskOpDto } from "./sync.dto";

interface SyncTask {
  id: string;
  title: string;
  notes: string | null;
  status: "OPEN" | "COMPLETED" | "CANCELED";
  when: string | null;
  deadline: string | null;
  allDay: boolean;
  projectId: string | null;
  areaId: string | null;
  sortOrder: number;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  version: number;
  tags: string[];
}

export interface PullResult {
  serverTime: string;
  tasks: SyncTask[];
}

export interface PushOpResult {
  id: string;
  op: TaskOpDto["op"];
  status: "applied" | "ignored" | "conflict";
  serverVersion?: number;
  serverUpdatedAt?: string;
  reason?: string;
}

@Injectable()
export class SyncService {
  constructor(private readonly prisma: PrismaService) {}

  async pull(ownerId: string, since: Date | null): Promise<PullResult> {
    const tasks = await this.prisma.task.findMany({
      where: {
        ownerId,
        ...(since ? { updatedAt: { gt: since } } : {}),
      },
      include: { taskTags: { include: { tag: true } } },
      orderBy: { updatedAt: "asc" },
    });

    return {
      serverTime: new Date().toISOString(),
      tasks: tasks.map((t) => this.toSyncTask(t)),
    };
  }

  async push(ownerId: string, ops: TaskOpDto[]): Promise<PushOpResult[]> {
    const results: PushOpResult[] = [];
    // 트랜잭션 1개로 묶어 외부 일관성 보장.
    await this.prisma.$transaction(async (tx) => {
      for (const op of ops) {
        try {
          const r = await this.applyOp(tx as PrismaService, ownerId, op);
          results.push(r);
        } catch (err) {
          results.push({
            id: op.id,
            op: op.op,
            status: "conflict",
            reason: (err as Error).message,
          });
        }
      }
    });
    return results;
  }

  private async applyOp(
    tx: PrismaService,
    ownerId: string,
    op: TaskOpDto,
  ): Promise<PushOpResult> {
    const existing = await tx.task.findFirst({
      where: { id: op.id, ownerId },
    });

    // LWW: 공통 resolver 사용 (skew 5초 허용).
    if (existing) {
      const decision = resolveConflict({
        serverUpdatedAt: existing.updatedAt,
        clientUpdatedAt: op.clientUpdatedAt,
      });
      if (decision === "ignore") {
        return {
          id: op.id,
          op: op.op,
          status: "ignored",
          serverVersion: existing.version,
          serverUpdatedAt: existing.updatedAt.toISOString(),
          reason: "server has newer version",
        };
      }
    }

    if (op.op === "create") {
      if (existing) {
        // 멱등 — 같은 id 재전송은 update 로 처리
        return this.doUpdate(tx, ownerId, op);
      }
      const tagsConnect = op.tags
        ? await this.connectOrCreateTags(tx, ownerId, op.tags)
        : undefined;
      const created = await tx.task.create({
        data: {
          id: op.id,
          ownerId,
          title: op.title ?? "(제목 없음)",
          notes: op.notes ?? null,
          when: op.when ? new Date(op.when) : null,
          deadline: op.deadline ? new Date(op.deadline) : null,
          allDay: op.allDay ?? true,
          projectId: op.projectId ?? null,
          areaId: op.areaId ?? null,
          sortOrder: op.sortOrder ?? 0,
          taskTags: tagsConnect,
        },
      });
      return { id: created.id, op: "create", status: "applied", serverVersion: created.version };
    }

    if (!existing) {
      return { id: op.id, op: op.op, status: "ignored", reason: "task not found" };
    }

    if (op.op === "delete") {
      const updated = await tx.task.update({
        where: { id: op.id },
        data: { deletedAt: new Date(), version: { increment: 1 } },
      });
      return { id: op.id, op: "delete", status: "applied", serverVersion: updated.version };
    }

    if (op.op === "complete") {
      const updated = await tx.task.update({
        where: { id: op.id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          version: { increment: 1 },
        },
      });
      return { id: op.id, op: "complete", status: "applied", serverVersion: updated.version };
    }

    if (op.op === "uncomplete") {
      const updated = await tx.task.update({
        where: { id: op.id },
        data: { status: "OPEN", completedAt: null, version: { increment: 1 } },
      });
      return { id: op.id, op: "uncomplete", status: "applied", serverVersion: updated.version };
    }

    return this.doUpdate(tx, ownerId, op);
  }

  private async doUpdate(
    tx: PrismaService,
    ownerId: string,
    op: TaskOpDto,
  ): Promise<PushOpResult> {
    const tagsConnect = op.tags
      ? await this.replaceTags(tx, ownerId, op.id, op.tags)
      : undefined;
    const updated = await tx.task.update({
      where: { id: op.id },
      data: {
        title: op.title ?? undefined,
        notes: op.notes ?? undefined,
        when: op.when === undefined ? undefined : op.when ? new Date(op.when) : null,
        deadline:
          op.deadline === undefined
            ? undefined
            : op.deadline
              ? new Date(op.deadline)
              : null,
        allDay: op.allDay ?? undefined,
        projectId: op.projectId ?? undefined,
        areaId: op.areaId ?? undefined,
        sortOrder: op.sortOrder ?? undefined,
        version: { increment: 1 },
        taskTags: tagsConnect,
      },
    });
    return { id: updated.id, op: "update", status: "applied", serverVersion: updated.version };
  }

  private async connectOrCreateTags(
    tx: PrismaService,
    ownerId: string,
    names: string[],
  ) {
    const tags = await Promise.all(
      names.map((name) =>
        tx.tag.upsert({
          where: { ownerId_name: { ownerId, name } },
          update: {},
          create: { ownerId, name },
        }),
      ),
    );
    return { create: tags.map((t) => ({ tagId: t.id })) };
  }

  private async replaceTags(
    tx: PrismaService,
    ownerId: string,
    taskId: string,
    names: string[],
  ) {
    await tx.taskTag.deleteMany({ where: { taskId } });
    return this.connectOrCreateTags(tx, ownerId, names);
  }

  private toSyncTask(t: {
    id: string;
    title: string;
    notes: string | null;
    status: "OPEN" | "COMPLETED" | "CANCELED";
    when: Date | null;
    deadline: Date | null;
    allDay: boolean;
    projectId: string | null;
    areaId: string | null;
    sortOrder: number;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    version: number;
    taskTags: { tag: { name: string } }[];
  }): SyncTask {
    return {
      id: t.id,
      title: t.title,
      notes: t.notes,
      status: t.status,
      when: t.when?.toISOString() ?? null,
      deadline: t.deadline?.toISOString() ?? null,
      allDay: t.allDay,
      projectId: t.projectId,
      areaId: t.areaId,
      sortOrder: t.sortOrder,
      completedAt: t.completedAt?.toISOString() ?? null,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      deletedAt: t.deletedAt?.toISOString() ?? null,
      version: t.version,
      tags: t.taskTags.map((tt) => tt.tag.name),
    };
  }
}
