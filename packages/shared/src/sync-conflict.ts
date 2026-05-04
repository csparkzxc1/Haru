/**
 * 동기화 충돌 해결 — Last Writer Wins.
 *
 * 백엔드와 모바일에서 모두 동일한 규칙으로 판정해야 하므로 shared 패키지에
 * 둔다. ISO 8601 문자열을 받는다.
 *
 *   - 클라이언트 op 의 client_updated_at 이 서버의 updated_at 보다 미래이면
 *     "apply"
 *   - 같으면 "apply" (클라이언트가 보낸 변경을 신뢰; 멱등 처리)
 *   - 과거이면 "ignore"
 *
 * 시계 왜곡 허용 윈도우(skewMs, 기본 5초): 서버보다 5초 이내 과거여도
 * apply. 모바일 오프라인 시 시계가 약간 어긋나는 흔한 케이스 대응.
 */

export type ConflictDecision = "apply" | "ignore";

export interface ConflictInput {
  serverUpdatedAt: string | Date | null;
  clientUpdatedAt: string | Date;
  skewMs?: number;
}

export function resolveConflict(input: ConflictInput): ConflictDecision {
  const skew = input.skewMs ?? 5_000;
  if (input.serverUpdatedAt === null) return "apply";
  const server = toMs(input.serverUpdatedAt);
  const client = toMs(input.clientUpdatedAt);
  if (Number.isNaN(server) || Number.isNaN(client)) return "apply";
  if (client + skew >= server) return "apply";
  return "ignore";
}

function toMs(v: string | Date): number {
  return v instanceof Date ? v.getTime() : new Date(v).getTime();
}
