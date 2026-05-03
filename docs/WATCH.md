# Apple Watch · Wear OS 가이드

워치 앱은 매우 제한된 환경에서 동작합니다. CPU 1코어, 배터리 ~310 mAh,
백그라운드 새로고침은 30분~1시간 단위. 그래서 본 프로젝트의 워치 전략은
**얇게**:

- 모든 인터랙션을 백엔드 1~2 호출로 끝낸다
- 응답 페이로드는 < 1KB
- UI 는 OS 단의 SwiftUI / Compose 만 사용 (RN 워치 SDK 미사용)

## 백엔드 (구현됨)

```
GET /api/watch/today  →
{
  "d": "2026-05-02",   // date
  "n": 4,              // total
  "c": 1,              // completed
  "t": [               // 오늘 미완료 task 최대 3개
    { "i": "...uuid", "x": "주간보고 초안 작성", "h": 9, "m": 0 },
    { "i": "...uuid", "x": "치과 예약 확정 전화", "h": 13, "m": 0 },
    { "i": "...uuid", "x": "김부장 자녀 결혼식 참석", "h": null, "m": null }
  ]
}

POST /api/watch/complete  body { id }  →  { "ok": true }
```

전체 응답 < 1KB. 단축 키(`d/n/c/t/i/x/h/m`)로 페이로드 추가 절감.

## iOS Watch 앱 (TODO)

Xcode 에서 새 watchOS App target (`HaruWatch`) 추가:

1. **인증 토큰 공유**: iPhone 앱이 keychain access group `group.kr.haru.app`
   에 access/refresh 토큰을 저장 → Watch 앱이 같은 그룹에서 읽기.
2. **Networking**: `URLSession` 으로 위 두 endpoint 호출. 30분 간격
   `WKApplicationRefreshBackgroundTask` 로 신선도 유지.
3. **UI 3 종**:
   - **Complications** (워치페이스 위젯): 진행률 도넛 (`c/n`) + 다음 1개 task
   - **Main app**: List with checkmarks. 탭 = `POST /complete`
   - **Smart Stack**: iOS 17+ Live Activity 변형
4. **햅틱**: `WKInterfaceDevice.current().play(.success)` 완료 시.

### SwiftUI 스켈레톤

```swift
struct TodayView: View {
    @StateObject var vm = TodayVM()
    var body: some View {
        List(vm.tasks) { t in
            HStack {
                Text(t.x).lineLimit(1)
                Spacer()
                if let h = t.h { Text("\(h):\(t.m ?? 0, specifier: "%02d")") }
            }
            .swipeActions(edge: .trailing) {
                Button("완료") { vm.complete(t.i) }.tint(.orange)
            }
        }
        .navigationTitle("오늘")
        .task { await vm.refresh() }
    }
}
```

## Wear OS 앱 (TODO)

Android Studio 에서 새 Wear OS module:

1. **인증 토큰 공유**: `EncryptedSharedPreferences` (foreground only) 또는
   Wearable Data Layer 로 phone → watch 미러링.
2. **UI**: Compose for Wear OS.
3. **Background**: `WorkManager` + `OngoingActivity` 로 진행률 표시.
4. **Tile** (워치페이스 옆 카드): 진행률 + 다음 task 1개.

## Expo 통합 — config plugin (TODO)

iOS Watch / Wear OS extension 은 Expo prebuild 만으로는 자동 생성 불가.
다음 중 한 방법:

- **EAS Build** + custom dev client. native 코드를 `ios/HaruWatch/` 와
  `android/wear/` 에 직접 작성 후 git 에 commit.
- 별도 git repo 로 분리 (Watch app 은 phone app과 약결합 — 동일 백엔드만 공유).

본 저장소엔 **백엔드 endpoint 만 포함**되어 있습니다. Watch 자체 구현은
디자인 + 디바이스 보유 후 별도 PR 로 진행 권장.
