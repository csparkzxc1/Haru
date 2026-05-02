/**
 * 모바일 알림.
 *
 *  1) 원격 푸시 토큰을 백엔드에 등록 (Expo Push)
 *  2) 로컬 알림: 예정 시각이 있는 task에 대해 OS에 직접 스케줄. 백엔드 도움
 *     없이도 동작하므로 오프라인/저전력 환경에서 신뢰할 수 있다.
 *
 *  로컬 알림 동기화 전략:
 *   - sync 후 또는 task 변경 후 호출되는 `syncLocalNotifications()` 가
 *     기존 스케줄을 모두 취소하고 다시 만든다. 단순하지만 task 수가 적은
 *     v1 단계에서 충분.
 */

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { request } from "./api";
import { localDb } from "./db";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function ensurePushPermission(): Promise<boolean> {
  if (!Device.isDevice) return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (status !== "granted") {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "기본",
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: "#FF6B35",
    });
  }
  return status === "granted";
}

export async function registerPushTokenWithBackend(): Promise<void> {
  if (!Device.isDevice) return;
  try {
    const granted = await ensurePushPermission();
    if (!granted) return;
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;
    const tokenResp = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    await request("/notifications/devices", {
      method: "POST",
      body: JSON.stringify({
        token: tokenResp.data,
        platform: "expo",
        deviceLabel: `${Device.osName ?? Platform.OS} ${Device.osVersion ?? ""}`.trim(),
      }),
    });
  } catch (err) {
    console.warn("[push] 등록 실패:", (err as Error).message);
  }
}

/**
 * 로컬 DB의 future-scheduled task 와 OS 알림을 일치시킨다.
 *
 *  단순화: 모두 취소 후 재등록. v1 규모(< 64건) 기준 비용 무시 가능.
 *  iOS 64개 제한, Android 무제한.
 */
export async function syncLocalNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const upcoming = await localDb.listFutureScheduled();
    const now = Date.now();
    for (const t of upcoming) {
      if (!t.when) continue;
      const ts = new Date(t.when).getTime();
      if (ts <= now) continue;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "하루",
          body: t.title,
          data: { taskId: t.id },
          sound: "default",
        },
        trigger: { date: new Date(ts) } as Notifications.NotificationTriggerInput,
      });
    }
  } catch (err) {
    console.warn("[notify] 로컬 스케줄 실패:", (err as Error).message);
  }
}
