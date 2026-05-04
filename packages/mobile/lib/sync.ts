/**
 * 동기화 엔진.
 *
 * 흐름:
 *   1) flushOutbox(): 로컬에서 누적된 변형을 /sync/push 로 일괄 전송
 *   2) pullChanges(): /sync/pull?since=<watermark> 로 변경 피드 수신 후
 *      LWW 규칙으로 로컬 tasks 테이블에 머지
 *
 * 충돌 정책:
 *   - 같은 task에 로컬 dirty + 서버 새 버전이면, 로컬이 더 최신 updatedAt 인 경우만 보존
 *   - 서버가 LWW 판정자 — POST /sync/push 응답에서 status=ignored 이면 서버 버전 채택
 */

import type { LocalTask, ServerTask } from "./db";
import { localDb } from "./db";
import { request } from "./api";

interface PullResult {
  serverTime: string;
  tasks: ServerTask[];
}

interface PushOpResult {
  id: string;
  op: "create" | "update" | "complete" | "uncomplete" | "delete";
  status: "applied" | "ignored" | "conflict";
  serverVersion?: number;
  serverUpdatedAt?: string;
  reason?: string;
}

const WATERMARK_KEY = "sync.lastPullAt";

let inflight: Promise<void> | null = null;

export async function syncNow(): Promise<void> {
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      await flushOutbox();
      await pullChanges();
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

async function flushOutbox(): Promise<void> {
  const queue = await localDb.listOutbox();
  if (queue.length === 0) return;

  const ops = queue.map((q) => ({
    op: q.op,
    id: q.task_id,
    clientUpdatedAt: q.client_updated_at,
    ...q.payload,
  }));

  let results: PushOpResult[];
  try {
    results = await request<PushOpResult[]>("/sync/push", {
      method: "POST",
      body: JSON.stringify({ ops }),
    });
  } catch (err) {
    // 네트워크 오류 — 큐 보존하고 다음 기회에 재시도
    console.warn("[sync] push 실패, 큐 보존:", (err as Error).message);
    return;
  }

  // 적용된 것만 큐에서 제거. ignored/conflict 도 일단 제거하고 다음 pull 로 정정.
  const seqs = queue.map((q) => q.seq);
  await localDb.deleteOutboxBySeqs(seqs);
  const taskIds = Array.from(new Set(queue.map((q) => q.task_id)));
  await localDb.markClean(taskIds);

  const conflicts = results.filter((r) => r.status === "ignored" || r.status === "conflict");
  if (conflicts.length > 0) {
    console.warn(`[sync] ${conflicts.length}건 충돌/무시 — 다음 pull 에서 정정`);
  }
}

async function pullChanges(): Promise<void> {
  const since = await localDb.getMeta(WATERMARK_KEY);
  const url = since ? `/sync/pull?since=${encodeURIComponent(since)}` : "/sync/pull";
  let result: PullResult;
  try {
    result = await request<PullResult>(url);
  } catch (err) {
    console.warn("[sync] pull 실패:", (err as Error).message);
    return;
  }
  await localDb.upsertFromServer(result.tasks);
  await localDb.setMeta(WATERMARK_KEY, result.serverTime);
}

export async function clearAfterLogout(): Promise<void> {
  await localDb.wipe();
}

export type { LocalTask };
