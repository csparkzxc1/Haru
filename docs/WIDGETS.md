# 홈 위젯 가이드 — iOS · Android

하루의 위젯은 백엔드의 `/api/widgets/today` · `/api/widgets/dday` 엔드포인트를
주기적으로 폴링해 표시합니다. v1 단계에서는 **데이터 엔드포인트만** 구현되어
있고 네이티브 위젯 코드는 아직 추가되어 있지 않습니다. 본 문서는 후속 작업의
가이드입니다.

## 백엔드 (구현됨)

```
GET /api/widgets/today  →
{
  "date": "2026-05-02",
  "holiday": "어린이날" | null,
  "total": 4,
  "done": 1,
  "progress": 25,
  "preview": [
    { "id": "...", "title": "팀 회의", "when": "2026-05-02T05:00:00.000Z", "status": "OPEN" },
    ...
  ]
}

GET /api/widgets/dday →
[
  { "id": "...", "title": "프로젝트 마감", "deadline": "...", "daysLeft": 3 },
  ...
]
```

응답이 작도록 설계되었으며 (각 < 1KB) iOS/Android 위젯의 네트워크 예산에
적합합니다.

## iOS 위젯 (TODO)

1. Xcode 에서 새 Widget Extension target 추가 (`HaruWidget`)
2. `WidgetExtension.swift` 의 `TimelineProvider` 가 다음을 수행:
   - 키체인에서 access/refresh 토큰 읽기 (App Group: `group.kr.haru.app`)
   - `URLSession` 으로 위 엔드포인트 호출
   - 30분 간격 timeline entry 생성
3. SwiftUI `View` 로 표시:
   - `.systemSmall`: 진행률 도넛 + 다음 1개 task
   - `.systemMedium`: 상위 3개 task + 진행률
   - `.systemLarge`: 전체 5개 + D-Day 위젯
4. Expo 앱에서 토큰을 App Group 으로 미러링 — `react-native-keychain`
   같은 라이브러리 또는 native module 작성 필요.

## Android 위젯 (TODO)

1. `app/src/main/AndroidManifest.xml` 에 `<receiver>` 추가
2. Glance(Compose for Widgets) 또는 `RemoteViews` 로 UI 작성
3. `WorkManager` 로 30분 간격 새로고침 jobs 등록
4. EncryptedSharedPreferences 로 토큰 공유

## Expo 통합 — config plugin (TODO)

위 두 native 작업을 Expo prebuild 기반으로 자동화하려면 `expo-modules-core`
custom plugin 작성이 필요합니다. EAS Build 환경에서만 빌드 가능합니다.

## 임시 대안 — Live Activities / Today 노티피케이션

위젯 코드 도입 전까지 `expo-notifications` 의 daily digest 노티피케이션이
대용으로 사용됩니다 (Phase 1 구현 완료).
