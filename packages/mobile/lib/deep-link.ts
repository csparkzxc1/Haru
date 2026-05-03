/**
 * Deep link / URL scheme 핸들러.
 *
 * 등록 scheme: `haru://` (app.json scheme + Android intentFilters)
 *
 * 지원 패턴:
 *   haru://add?title=<인코딩된 자연어>
 *      → 자연어 1줄 즉시 추가. iOS Shortcuts / Android Intent / 웹 링크 모두에서 호출.
 *   haru://open?path=/today
 *      → 화면 이동.
 *   haru://login?refresh=<token>
 *      → 카카오 OAuth callback 처럼 토큰 직접 주입 (향후).
 *
 * 사용:
 *   useEffect(() => {
 *     const sub = Linking.addEventListener("url", handleDeepLink);
 *     Linking.getInitialURL().then((url) => url && handleDeepLink({ url }));
 *     return () => sub.remove();
 *   }, []);
 */

import { router } from "expo-router";
import * as Linking from "expo-linking";
import { localDb } from "./db";
import { syncNow } from "./sync";
import { parseKoreanEntry } from "@haru/shared/korean-date";
import { syncLocalNotifications } from "./notifications";

/** RFC 4122 v4 UUID — react-native crypto polyfill 회피용 inline. */
function uuidv4(): string {
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export async function handleDeepLink({ url }: { url: string }): Promise<void> {
  if (!url.startsWith("haru://")) return;
  const parsed = Linking.parse(url);

  switch (parsed.hostname) {
    case "add": {
      const raw =
        typeof parsed.queryParams?.title === "string"
          ? parsed.queryParams.title
          : null;
      if (!raw) return;
      await addTaskFromText(raw);
      router.replace("/" as never);
      return;
    }
    case "open": {
      const path =
        typeof parsed.queryParams?.path === "string"
          ? parsed.queryParams.path
          : "/";
      router.replace(path as never);
      return;
    }
    default:
      return;
  }
}

async function addTaskFromText(raw: string): Promise<void> {
  const parsed = parseKoreanEntry(raw);
  const id = uuidv4();
  const now = new Date().toISOString();
  await localDb.insertLocal({
    id,
    title: parsed.title,
    notes: null,
    status: "OPEN",
    when: parsed.when,
    deadline: parsed.deadline,
    allDay: parsed.allDay,
    projectId: null,
    areaId: null,
    sortOrder: 0,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    version: 1,
    tags: parsed.tags,
  });
  await localDb.enqueueOutbox(id, "create", {
    title: parsed.title,
    when: parsed.when,
    deadline: parsed.deadline,
    allDay: parsed.allDay,
    tags: parsed.tags,
  });
  void syncNow().then(() => syncLocalNotifications());
}
