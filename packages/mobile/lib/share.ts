import { Share, Platform, Linking } from "react-native";

/**
 * 카카오톡/네이버 등 한국 주요 메신저는 모두 OS 단의 시스템 공유 시트를
 * 인식하므로 RN Share 한 번이면 충분하다. 카카오 SDK 직접 통합은
 * 카카오 개발자 등록·앱 키 발급이 필요하므로 v1 단계에선 시스템 공유로 갈음.
 */
export async function shareUrl(opts: {
  title?: string;
  message: string;
  url?: string;
}): Promise<boolean> {
  try {
    const result = await Share.share({
      title: opts.title,
      message:
        Platform.OS === "ios"
          ? opts.message
          : `${opts.message}${opts.url ? `\n${opts.url}` : ""}`,
      url: Platform.OS === "ios" ? opts.url : undefined,
    });
    return result.action === Share.sharedAction;
  } catch {
    if (opts.url) {
      await Linking.openURL(opts.url);
      return true;
    }
    return false;
  }
}
