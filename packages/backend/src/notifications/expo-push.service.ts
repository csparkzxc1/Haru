import { Injectable, Logger } from "@nestjs/common";

/**
 * Expo Push 어댑터.
 *
 * v1: HTTP API를 직접 호출 (expo-server-sdk 미사용으로 의존성 최소화).
 * 토큰이 비어 있거나 호출 실패해도 throw 하지 않고 로그만 남긴다 — 알림은
 * 부가 기능이므로 다른 요청을 막지 않는다.
 *
 * 운영 시: rate limit, batching(100건/요청), retries, receipts 폴링 추가.
 */

export interface ExpoPushMessage {
  to: string;
  title?: string;
  body?: string;
  data?: Record<string, unknown>;
  sound?: "default" | null;
}

@Injectable()
export class ExpoPushService {
  private readonly logger = new Logger(ExpoPushService.name);
  private readonly endpoint = "https://exp.host/--/api/v2/push/send";

  async send(messages: ExpoPushMessage[]): Promise<void> {
    if (messages.length === 0) return;
    const valid = messages.filter((m) => m.to.startsWith("ExponentPushToken["));
    if (valid.length === 0) {
      this.logger.debug("no valid Expo tokens, skipping send");
      return;
    }

    try {
      const res = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          accept: "application/json",
          "accept-encoding": "gzip, deflate",
          "content-type": "application/json",
        },
        body: JSON.stringify(valid),
      });
      if (!res.ok) {
        this.logger.warn(`Expo push HTTP ${res.status}`);
      }
    } catch (err) {
      this.logger.warn(`Expo push 실패: ${(err as Error).message}`);
    }
  }
}
