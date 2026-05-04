# Shortcuts · Siri · 빅스비 연동

iOS Shortcuts, macOS Shortcuts, Siri, Android Quick Tiles, Bixby Routines
를 모두 같은 인터페이스(URL scheme + 백엔드 API)로 묶습니다.

## URL Scheme — `haru://`

모바일 앱(`packages/mobile/lib/deep-link.ts`) 과 데스크톱 앱(Tauri
deep-link plugin) 이 모두 등록·처리합니다.

| URL | 동작 |
|---|---|
| `haru://add?title=내일%20오후%203시%20팀%20회의%20%23회의` | 자연어 1줄 → 즉시 task 생성 |
| `haru://open?path=/today` | 오늘 화면 열기 |
| `haru://open?path=/family-events` | 경조사 화면 |

자연어는 그대로 `parseKoreanEntry()` 통해 분해 → 로컬 SQLite 저장 →
백그라운드 sync.

## iOS Shortcuts — App Intents (iOS 16+)

`packages/mobile/app.json` 에 등록된 supportedShortcuts 두 개를 native
Swift 에서 `AppIntent` protocol 로 구현합니다 (Expo prebuild 후 ios/
디렉터리에 직접 작성).

### AddTaskIntent.swift (예시)

```swift
import AppIntents

struct AddTaskIntent: AppIntent {
    static let title: LocalizedStringResource = "하루에 추가"
    static let description = IntentDescription("자연어로 할 일 추가")

    @Parameter(title: "내용", inputOptions: .init(keyboardType: .default))
    var text: String

    func perform() async throws -> some IntentResult {
        // URL scheme 으로 위임 — RN 앱이 실제 처리
        let encoded = text.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""
        await UIApplication.shared.open(URL(string: "haru://add?title=\(encoded)")!)
        return .result(dialog: "추가했습니다.")
    }
}
```

이 한 개 intent 로:
- "헤이 시리, 하루에 추가, 내일 오후 3시 회의" → 음성으로 task 생성
- iOS Shortcuts 앱에서 visual workflow 의 한 액션으로 사용
- 잠금화면 단축키 / Action Button (iPhone 15 Pro+) 에 매핑

### OpenTodayIntent.swift

```swift
struct OpenTodayIntent: AppIntent {
    static let title: LocalizedStringResource = "오늘 보기"
    static let openAppWhenRun = true

    func perform() async throws -> some IntentResult {
        await UIApplication.shared.open(URL(string: "haru://open?path=/today")!)
        return .result()
    }
}
```

## macOS Shortcuts

iOS App Intents 는 macOS Shortcuts 에서도 동일하게 노출됩니다 (iOS 앱이
Mac Catalyst 또는 "Designed for iPad" 모드로 설치된 경우).

데스크톱 전용으로는 Tauri 가 등록한 `haru://` scheme 으로 충분합니다:

```bash
# macOS Shortcuts → "URL 열기" 액션
open "haru://add?title=$(uuencode <<< '$1' | tail -1)"
```

## Android — Quick Tiles + Intent

`app.json` 의 `intentFilters` 가 등록되면 ADB 또는 다른 앱에서 호출 가능:

```bash
adb shell am start -W -a android.intent.action.VIEW \
  -d "haru://add?title=내일 회의" kr.haru.app
```

### Wear OS Tile

`Wear OS Tile` 컴포넌트가 위 Intent 를 호출 → 워치페이스 옆 카드에서
바로 task 추가.

## 빅스비 (Bixby Capsules) — 검토만

빅스비 Capsules 는 별도 등록·심사가 필요하며 (Galaxy Store), 한국 시장
점유율 대비 ROI 가 낮아 **Phase 4 후반 보류**. 대신 Android 의 표준
Voice Intent (`android.intent.action.VOICE_COMMAND`) 를 등록해 빅스비/
구글 어시스턴트가 모두 같은 진입점을 쓰게 한다.

## Raycast / Alfred (macOS)

Tauri 가 등록한 URL scheme 을 그대로 활용:

```bash
# Raycast Script Command (bash)
# title: "하루에 추가"
# argument1: { type: text, placeholder: "예: 내일 회의" }
open "haru://add?title=$1"
```

## 보안 주의

- Deep link 는 **인증되지 않은 호출**입니다. 토큰을 URL parameter 로 받지
  마세요 — 카카오 OAuth callback 처럼 fragment(#) 를 사용하거나 별도
  signed token endpoint 로.
- `haru://add` 는 로컬 SQLite 만 변경하므로 안전. 백엔드 sync 시 정상
  인증된 사용자의 토큰으로 업로드됨.
- `haru://login?...` 같은 인증 우회 패턴은 **절대 추가하지 마세요**.
