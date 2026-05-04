/**
 * OTA (over-the-air) 업데이트.
 *
 * EAS Update 가 채널별로(`production` / `preview` / `development`) 호스팅한
 * 새 JS 번들을 백그라운드에서 받아 두고, 다음 콜드 스타트에 적용한다.
 *
 *   `pnpm --filter @haru/mobile update:prod -- "버그 수정"` →
 *      production 채널 사용자에게 자동 배포 (앱스토어 심사 우회).
 *
 *   네이티브 코드 변경(예: 새 expo 모듈) 은 OTA 로 못 보낸다 — 그땐 정식
 *   빌드(eas build) 후 스토어 심사 또는 internal track 으로 배포.
 */

import * as Updates from "expo-updates";

let lastCheckAt = 0;
const MIN_INTERVAL_MS = 5 * 60 * 1000; // 5분 — 과도한 polling 방지

export async function checkForUpdates(): Promise<{
  applied: boolean;
  reason?: string;
}> {
  // 개발 모드에선 OTA 비활성 (Metro dev server 가 우선)
  if (__DEV__ || !Updates.isEnabled) {
    return { applied: false, reason: "dev or disabled" };
  }
  if (Date.now() - lastCheckAt < MIN_INTERVAL_MS) {
    return { applied: false, reason: "throttled" };
  }
  lastCheckAt = Date.now();

  try {
    const result = await Updates.checkForUpdateAsync();
    if (!result.isAvailable) return { applied: false, reason: "up-to-date" };

    await Updates.fetchUpdateAsync();
    // 다음 콜드 스타트에 적용. 즉시 reload 가 필요하면 reloadAsync().
    return { applied: true };
  } catch (err) {
    // 네트워크 오류 — 다음 기회에 재시도
    return { applied: false, reason: (err as Error).message };
  }
}
