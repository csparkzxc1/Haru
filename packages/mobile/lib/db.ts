/**
 * 모바일 로컬 캐시 — expo-sqlite v15 (async API).
 *
 * 두 테이블을 둔다.
 *   - tasks   : 서버 상태의 미러 + 로컬 변경 표시(dirty, dirty_op)
 *   - outbox  : 아직 서버에 푸시되지 않은 변형 큐 (영구화)
 *   - meta    : 마지막 풀(pull) 시간 워터마크 등 KV
 *
 * 주의:
 *   - 시간은 ISO 8601 문자열로 저장. SQLite native datetime 미사용.
 *   - tags 는 JSON 직렬화.
 */

import * as SQLite from "expo-sqlite";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync("haru.db");
  }
  return dbPromise;
}

export async function initDb(): Promise<void> {
  const db = await getDb();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'OPEN',
      "when" TEXT,
      deadline TEXT,
      all_day INTEGER NOT NULL DEFAULT 1,
      project_id TEXT,
      area_id TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      completed_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT,
      version INTEGER NOT NULL DEFAULT 1,
      tags_json TEXT NOT NULL DEFAULT '[]',
      dirty INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_when ON tasks("when");
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status, deleted_at);

    CREATE TABLE IF NOT EXISTS outbox (
      seq INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id TEXT NOT NULL,
      op TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      client_updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_outbox_task ON outbox(task_id);

    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

export interface LocalTask {
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
  dirty: boolean;
}

interface TaskRow {
  id: string;
  title: string;
  notes: string | null;
  status: "OPEN" | "COMPLETED" | "CANCELED";
  when: string | null;
  deadline: string | null;
  all_day: number;
  project_id: string | null;
  area_id: string | null;
  sort_order: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  version: number;
  tags_json: string;
  dirty: number;
}

function rowToTask(r: TaskRow): LocalTask {
  return {
    id: r.id,
    title: r.title,
    notes: r.notes,
    status: r.status,
    when: r.when,
    deadline: r.deadline,
    allDay: !!r.all_day,
    projectId: r.project_id,
    areaId: r.area_id,
    sortOrder: r.sort_order,
    completedAt: r.completed_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    deletedAt: r.deleted_at,
    version: r.version,
    tags: JSON.parse(r.tags_json) as string[],
    dirty: !!r.dirty,
  };
}

export interface ServerTask {
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

export const localDb = {
  /** 서버에서 받은 변경분을 로컬에 반영. dirty 인 행은 덮지 않는다. */
  async upsertFromServer(tasks: ServerTask[]): Promise<void> {
    if (tasks.length === 0) return;
    const db = await getDb();
    await db.withTransactionAsync(async () => {
      for (const t of tasks) {
        const existing = await db.getFirstAsync<TaskRow>(
          "SELECT * FROM tasks WHERE id = ?",
          t.id,
        );
        if (existing && existing.dirty) {
          // 로컬에 미반영 변경 있음 — 서버 버전이 더 높지 않으면 보존.
          if (existing.version >= t.version) continue;
        }
        await db.runAsync(
          `INSERT OR REPLACE INTO tasks
           (id, title, notes, status, "when", deadline, all_day, project_id, area_id,
            sort_order, completed_at, created_at, updated_at, deleted_at, version,
            tags_json, dirty)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
          t.id,
          t.title,
          t.notes,
          t.status,
          t.when,
          t.deadline,
          t.allDay ? 1 : 0,
          t.projectId,
          t.areaId,
          t.sortOrder,
          t.completedAt,
          t.createdAt,
          t.updatedAt,
          t.deletedAt,
          t.version,
          JSON.stringify(t.tags),
        );
      }
    });
  },

  async insertLocal(t: Omit<LocalTask, "dirty">): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      `INSERT OR REPLACE INTO tasks
       (id, title, notes, status, "when", deadline, all_day, project_id, area_id,
        sort_order, completed_at, created_at, updated_at, deleted_at, version,
        tags_json, dirty)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      t.id,
      t.title,
      t.notes,
      t.status,
      t.when,
      t.deadline,
      t.allDay ? 1 : 0,
      t.projectId,
      t.areaId,
      t.sortOrder,
      t.completedAt,
      t.createdAt,
      t.updatedAt,
      t.deletedAt,
      t.version,
      JSON.stringify(t.tags),
    );
  },

  async patchLocal(
    id: string,
    patch: Partial<Pick<LocalTask, "status" | "completedAt" | "deletedAt" | "title">>,
  ): Promise<LocalTask | null> {
    const db = await getDb();
    const now = new Date().toISOString();
    const sets: string[] = ["updated_at = ?", "dirty = 1"];
    const vals: unknown[] = [now];
    if (patch.status !== undefined) {
      sets.push("status = ?");
      vals.push(patch.status);
    }
    if (patch.completedAt !== undefined) {
      sets.push("completed_at = ?");
      vals.push(patch.completedAt);
    }
    if (patch.deletedAt !== undefined) {
      sets.push("deleted_at = ?");
      vals.push(patch.deletedAt);
    }
    if (patch.title !== undefined) {
      sets.push("title = ?");
      vals.push(patch.title);
    }
    vals.push(id);
    await db.runAsync(`UPDATE tasks SET ${sets.join(", ")} WHERE id = ?`, ...vals);
    return this.getById(id);
  },

  async getById(id: string): Promise<LocalTask | null> {
    const db = await getDb();
    const row = await db.getFirstAsync<TaskRow>("SELECT * FROM tasks WHERE id = ?", id);
    return row ? rowToTask(row) : null;
  },

  async listByView(view: string): Promise<LocalTask[]> {
    const db = await getDb();
    const baseWhere = "deleted_at IS NULL";
    let sql = `SELECT * FROM tasks WHERE ${baseWhere} ORDER BY sort_order ASC, created_at DESC LIMIT 200`;
    const today = startOfTodayIso();
    const tomorrow = addDaysIso(today, 1);
    const weekStart = startOfWeekIso();
    const weekEnd = addDaysIso(weekStart, 7);

    switch (view) {
      case "today":
        sql = `SELECT * FROM tasks WHERE ${baseWhere} AND status = 'OPEN' AND "when" >= ? AND "when" < ? ORDER BY sort_order ASC, created_at DESC`;
        return (
          await (await getDb()).getAllAsync<TaskRow>(sql, today, tomorrow)
        ).map(rowToTask);
      case "thisWeek":
        sql = `SELECT * FROM tasks WHERE ${baseWhere} AND status = 'OPEN' AND "when" >= ? AND "when" < ? ORDER BY "when" ASC`;
        return (
          await (await getDb()).getAllAsync<TaskRow>(sql, weekStart, weekEnd)
        ).map(rowToTask);
      case "upcoming":
        sql = `SELECT * FROM tasks WHERE ${baseWhere} AND status = 'OPEN' AND "when" >= ? ORDER BY "when" ASC`;
        return (await (await getDb()).getAllAsync<TaskRow>(sql, tomorrow)).map(
          rowToTask,
        );
      case "anytime":
      case "someday":
        sql = `SELECT * FROM tasks WHERE ${baseWhere} AND status = 'OPEN' AND "when" IS NULL ORDER BY sort_order ASC`;
        return (await db.getAllAsync<TaskRow>(sql)).map(rowToTask);
      case "logbook":
        sql = `SELECT * FROM tasks WHERE ${baseWhere} AND status IN ('COMPLETED', 'CANCELED') ORDER BY completed_at DESC LIMIT 200`;
        return (await db.getAllAsync<TaskRow>(sql)).map(rowToTask);
      case "inbox":
      default:
        sql = `SELECT * FROM tasks WHERE ${baseWhere} AND status = 'OPEN' AND project_id IS NULL AND area_id IS NULL ORDER BY created_at DESC`;
        return (await db.getAllAsync<TaskRow>(sql)).map(rowToTask);
    }
  },

  /** "예정 시각이 미래"인 모든 활성 task — 로컬 알림 일정 동기화에 사용. */
  async listFutureScheduled(): Promise<LocalTask[]> {
    const db = await getDb();
    const now = new Date().toISOString();
    const rows = await db.getAllAsync<TaskRow>(
      `SELECT * FROM tasks
       WHERE deleted_at IS NULL AND status = 'OPEN' AND "when" IS NOT NULL AND "when" > ?
       ORDER BY "when" ASC LIMIT 64`,
      now,
    );
    return rows.map(rowToTask);
  },

  async enqueueOutbox(
    taskId: string,
    op: "create" | "update" | "complete" | "uncomplete" | "delete",
    payload: Record<string, unknown>,
  ): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      "INSERT INTO outbox (task_id, op, payload_json, client_updated_at) VALUES (?, ?, ?, ?)",
      taskId,
      op,
      JSON.stringify(payload),
      new Date().toISOString(),
    );
  },

  async listOutbox(limit = 100): Promise<
    {
      seq: number;
      task_id: string;
      op: string;
      payload: Record<string, unknown>;
      client_updated_at: string;
    }[]
  > {
    const db = await getDb();
    const rows = await db.getAllAsync<{
      seq: number;
      task_id: string;
      op: string;
      payload_json: string;
      client_updated_at: string;
    }>(`SELECT * FROM outbox ORDER BY seq ASC LIMIT ?`, limit);
    return rows.map((r) => ({
      seq: r.seq,
      task_id: r.task_id,
      op: r.op,
      payload: JSON.parse(r.payload_json) as Record<string, unknown>,
      client_updated_at: r.client_updated_at,
    }));
  },

  async deleteOutboxBySeqs(seqs: number[]): Promise<void> {
    if (seqs.length === 0) return;
    const db = await getDb();
    const placeholders = seqs.map(() => "?").join(",");
    await db.runAsync(`DELETE FROM outbox WHERE seq IN (${placeholders})`, ...seqs);
  },

  async markClean(taskIds: string[]): Promise<void> {
    if (taskIds.length === 0) return;
    const db = await getDb();
    const placeholders = taskIds.map(() => "?").join(",");
    await db.runAsync(
      `UPDATE tasks SET dirty = 0 WHERE id IN (${placeholders})`,
      ...taskIds,
    );
  },

  async getMeta(key: string): Promise<string | null> {
    const db = await getDb();
    const row = await db.getFirstAsync<{ value: string }>(
      "SELECT value FROM meta WHERE key = ?",
      key,
    );
    return row?.value ?? null;
  },

  async setMeta(key: string, value: string): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      "INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)",
      key,
      value,
    );
  },

  async wipe(): Promise<void> {
    const db = await getDb();
    await db.execAsync(
      "DELETE FROM tasks; DELETE FROM outbox; DELETE FROM meta;",
    );
  },
};

function startOfTodayIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function addDaysIso(iso: string, n: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

function startOfWeekIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay()); // Sunday-based
  return d.toISOString();
}
