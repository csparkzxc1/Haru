# @haru/desktop

Tauri 2.0 기반 macOS · Windows · Linux 데스크톱 앱.

## 디자인 결정

- 별도 데스크톱 UI 를 만들지 않고, **packages/web 의 Vercel 호스팅 빌드를
  webview 로 그대로 표시**합니다. Single source of truth 유지 + 데스크톱
  전용 코드 최소화.
- 데스크톱 고유 기능만 Rust(`src-tauri/src/lib.rs`) 에 구현:
  - 글로벌 메뉴 (4단 뷰 단축키 `Cmd+1` ~ `Cmd+5`)
  - 시스템 트레이 (좌클릭 = 토글, 우클릭 = 메뉴)
  - macOS 닫기 = 숨김 동작 (트레이로 살아있음)
  - Deep link `haru://...` URL scheme
  - OS native notifications (백엔드 푸시 forwarding 용)
- 메뉴/트레이 클릭은 webview 로 emit 하면 web 앱이 React Router 푸시.

## 실행

```bash
# 사전 요구 — Rust toolchain 설치 필요
#   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
pnpm install
pnpm --filter @haru/desktop dev      # devUrl = https://haru.vercel.app
```

## 빌드

```bash
pnpm --filter @haru/desktop build
# 산출물:
#   src-tauri/target/release/bundle/dmg/      → macOS
#   src-tauri/target/release/bundle/msi/      → Windows
#   src-tauri/target/release/bundle/deb/      → Linux
#   src-tauri/target/release/bundle/appimage/ → Linux
```

## 키보드 단축키

| 단축키 | 동작 |
|---|---|
| `Cmd/Ctrl + N` | 빠른 추가 모달 |
| `Cmd/Ctrl + R` | 동기화 트리거 |
| `Cmd/Ctrl + 1~5` | 4단 뷰 전환 (오늘/이번주/예정/언제든지/언젠가) |

## URL Scheme

```
haru://add?title=내일%20오후%203시%20팀%20회의%20%23회의
haru://open?path=/family-events
```

다른 앱(예: Alfred, Raycast, Apple Shortcuts)에서 위 URL 을 호출하면
하루가 자동으로 열리고 webview 가 해당 동작을 수행합니다.

## 알려진 한계

- 첫 1회 빌드 시 macOS / Windows 코드 서명 필요 (Apple Developer Program
  $99/년 또는 자체 서명). EAS 같은 통합 환경이 없어 수동 서명 필요.
- Linux ARM64 빌드는 별도 toolchain 필요.

## 향후

- `tauri-plugin-global-shortcut` 추가 → 단축키 `Opt+Space` 어디서나 빠른 추가
- Mac Menu Bar 앱 변형 (Dock 미표시 + 메뉴바에서만 동작)
- 백엔드 SSE 연결로 실시간 알림 forwarding (백엔드 측 SSE 엔드포인트 필요)
