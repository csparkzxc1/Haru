/**
 * 경량 i18n.
 *
 * 외부 라이브러리(i18next, react-intl) 없이 단순 lookup. 메시지 수가 작고
 * (< 100건) 동적 로케일 전환이 잦지 않은 v1 단계에 적합.
 *
 * Locale 추가 시:
 *   1) MESSAGES 에 새 언어 추가
 *   2) shared/src/japan-calendar.ts 같은 로케일별 도메인 모듈 추가
 *   3) 모바일 lib/locale.ts / 웹 lib/locale.ts 의 SUPPORTED_LOCALES 갱신
 */

export type Locale = "ko" | "ja";
export const SUPPORTED_LOCALES: Locale[] = ["ko", "ja"];
export const DEFAULT_LOCALE: Locale = "ko";

type MessageKey =
  | "today"
  | "thisWeek"
  | "upcoming"
  | "anytime"
  | "someday"
  | "logbook"
  | "inbox"
  | "settings"
  | "areas"
  | "familyEvents"
  | "quickEntry.placeholder"
  | "quickEntry.add"
  | "task.complete"
  | "task.uncomplete"
  | "task.delete"
  | "task.empty"
  | "loading"
  | "auth.login"
  | "auth.register"
  | "auth.logout"
  | "auth.email"
  | "auth.password"
  | "auth.nickname"
  | "auth.kakaoStart"
  | "settings.colorMode"
  | "settings.colorMode.system"
  | "settings.colorMode.light"
  | "settings.colorMode.dark"
  | "settings.fontSize"
  | "settings.fontSize.default"
  | "settings.fontSize.senior"
  | "settings.exportData"
  | "settings.deleteAccount"
  | "common.privacy"
  | "common.terms";

const MESSAGES: Record<Locale, Record<MessageKey, string>> = {
  ko: {
    today: "오늘",
    thisWeek: "이번주",
    upcoming: "예정",
    anytime: "언제든지",
    someday: "언젠가",
    logbook: "로그북",
    inbox: "수신함",
    settings: "설정",
    areas: "영역",
    familyEvents: "경조사·축의금",
    "quickEntry.placeholder": '예: "내일 오후 3시 팀 회의 #회의"',
    "quickEntry.add": "⏎ 추가",
    "task.complete": "완료",
    "task.uncomplete": "완료 취소",
    "task.delete": "삭제",
    "task.empty": "할 일이 없습니다.",
    loading: "불러오는 중…",
    "auth.login": "이메일로 로그인",
    "auth.register": "가입하기",
    "auth.logout": "로그아웃",
    "auth.email": "이메일",
    "auth.password": "비밀번호",
    "auth.nickname": "닉네임",
    "auth.kakaoStart": "카카오로 시작하기",
    "settings.colorMode": "색 모드",
    "settings.colorMode.system": "시스템",
    "settings.colorMode.light": "라이트",
    "settings.colorMode.dark": "다크",
    "settings.fontSize": "글자 크기",
    "settings.fontSize.default": "기본",
    "settings.fontSize.senior": "큰 글자 · 큰 버튼",
    "settings.exportData": "데이터 내보내기 (JSON)",
    "settings.deleteAccount": "회원 탈퇴",
    "common.privacy": "개인정보처리방침",
    "common.terms": "이용약관",
  },
  ja: {
    today: "今日",
    thisWeek: "今週",
    upcoming: "予定",
    anytime: "いつでも",
    someday: "いつか",
    logbook: "ログ",
    inbox: "受信箱",
    settings: "設定",
    areas: "エリア",
    familyEvents: "慶弔費",
    "quickEntry.placeholder": '例: "明日の午後3時 チーム会議 #会議"',
    "quickEntry.add": "⏎ 追加",
    "task.complete": "完了",
    "task.uncomplete": "完了を取り消す",
    "task.delete": "削除",
    "task.empty": "タスクはありません。",
    loading: "読み込み中…",
    "auth.login": "メールでログイン",
    "auth.register": "新規登録",
    "auth.logout": "ログアウト",
    "auth.email": "メールアドレス",
    "auth.password": "パスワード",
    "auth.nickname": "ニックネーム",
    "auth.kakaoStart": "カカオで始める",
    "settings.colorMode": "カラーモード",
    "settings.colorMode.system": "システム",
    "settings.colorMode.light": "ライト",
    "settings.colorMode.dark": "ダーク",
    "settings.fontSize": "文字サイズ",
    "settings.fontSize.default": "標準",
    "settings.fontSize.senior": "大きい文字・大きいボタン",
    "settings.exportData": "データのエクスポート (JSON)",
    "settings.deleteAccount": "アカウント削除",
    "common.privacy": "プライバシーポリシー",
    "common.terms": "利用規約",
  },
};

/**
 * t("today", "ja") === "今日"
 * 키가 없으면 한국어 fallback 후 키 자체 반환.
 */
export function t(key: MessageKey, locale: Locale = DEFAULT_LOCALE): string {
  return MESSAGES[locale]?.[key] ?? MESSAGES.ko[key] ?? key;
}

/**
 * Accept-Language 또는 navigator.language 같은 BCP 47 태그를 받아
 * 가장 가까운 지원 로케일로 좁힌다. ko, ko-KR → ko / ja, ja-JP → ja /
 * 그 외 → DEFAULT_LOCALE.
 */
export function resolveLocale(input: string | null | undefined): Locale {
  if (!input) return DEFAULT_LOCALE;
  const head = input.toLowerCase().split(/[-_]/)[0];
  return (SUPPORTED_LOCALES.includes(head as Locale) ? head : DEFAULT_LOCALE) as Locale;
}
