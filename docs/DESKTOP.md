# 데스크톱 (macOS · Windows · Linux)

Tauri 2.0 기반. 자세한 사용법은 [`packages/desktop/README.md`](../packages/desktop/README.md).

## 핵심 결정

**Web webview wrapper.** 별도 데스크톱 UI 를 만들지 않고 Vercel 호스팅 웹앱
을 그대로 webview 로 표시합니다. 데스크톱 전용 코드(Rust)는 OS 통합에만:

| 기능 | 코드 위치 | 비고 |
|---|---|---|
| 글로벌 메뉴 | `src-tauri/src/lib.rs::build_menu` | macOS 상단 바 / Win·Linux 윈도 메뉴 |
| 시스템 트레이 | `src-tauri/src/lib.rs::build_tray` | 좌클릭 토글 + 우클릭 메뉴 |
| macOS 닫기 = 숨김 | `on_window_event` | 트레이로 살아있게 유지 |
| Deep link `haru://` | `tauri-plugin-deep-link` | 모바일과 동일 scheme |
| OS 알림 | `tauri-plugin-notification` | 백엔드 SSE → native notification (TODO) |

## 단축키 매핑

웹앱은 데스크톱 전용 키 이벤트를 받기 위해 `@tauri-apps/api` 의 `event`
모듈을 listen 합니다 (이미 `packages/web` 에서 가능 — Tauri webview 가
window.__TAURI__ 노출).

```ts
// packages/web/src/lib/desktop-bridge.ts (추가 가능)
import { listen } from "@tauri-apps/api/event";

listen("menu:quick-add", () => openQuickEntryModal());
listen("menu:sync-now",  () => triggerSync());
listen("menu:navigate",  (e) => router.push(e.payload as string));
```

웹 단독으로 빌드된 경우 `window.__TAURI__` 가 undefined 이므로 안전하게
no-op:

```ts
if ("__TAURI__" in window) { /* desktop-only */ }
```

## 빌드 / 배포

```bash
pnpm --filter @haru/desktop build
# 산출물:
#   src-tauri/target/release/bundle/dmg/하루_0.1.0_aarch64.dmg     (macOS)
#   src-tauri/target/release/bundle/msi/하루_0.1.0_x64_en-US.msi   (Windows)
#   src-tauri/target/release/bundle/deb/하루_0.1.0_amd64.deb       (Linux)
```

서명·공증 (macOS):

```bash
# Apple Developer Program 가입 후 (.p12 인증서 + provisioning profile)
APPLE_ID=...@apple.com
APPLE_PASSWORD=app-specific-password   # https://appleid.apple.com
APPLE_TEAM_ID=ABC123XYZ

pnpm --filter @haru/desktop tauri build -- --target universal-apple-darwin

# Notarize (Apple 서버에 업로드 → 5~30분 후 staple)
xcrun notarytool submit "...dmg" \
  --apple-id "$APPLE_ID" \
  --password "$APPLE_PASSWORD" \
  --team-id "$APPLE_TEAM_ID" \
  --wait
xcrun stapler staple "...dmg"
```

## 배포 채널

- **GitHub Releases** — 무료. Sparkle/Squirrel 호환 manifest 자동 생성
  (Tauri updater plugin 추가 시).
- **Mac App Store** — 별도 sandbox 설정 + 인앱결제 의존성 검토 필요. v1.x
  단계엔 외부 직배포 권장.
- **Microsoft Store** — `.msix` 빌드 필요 (Tauri 별도 설정).
- **Linux** — `.deb` 직배포 + AUR PKGBUILD (커뮤니티 PR 환영).

## 자동 업데이트

Tauri updater 가 GitHub Releases 의 `latest.json` 을 주기적으로 polling →
새 버전이 있으면 OS 알림으로 안내 → 사용자 클릭 한 번에 백그라운드 다운로드
+ 재시작 적용. CI 워크플로 (`.github/workflows/desktop-release.yml`) 가
태그 push 시 자동으로 빌드·서명·업로드까지 처리합니다.

### 첫 설정

1. **서명 키 생성** (한 번만):

   ```bash
   pnpm dlx @tauri-apps/cli signer generate -w ~/.tauri/haru.key
   # 비밀번호 입력 후 두 파일 생성:
   #   ~/.tauri/haru.key      (private — 절대 commit 금지)
   #   ~/.tauri/haru.key.pub  (public — tauri.conf.json 에 박아넣음)
   ```

2. **public 키 등록**: `packages/desktop/src-tauri/tauri.conf.json` 의
   `plugins.updater.pubkey` 값을 `haru.key.pub` 내용으로 교체.

3. **GitHub secrets 등록**: 저장소 Settings → Secrets and variables → Actions:
   - `TAURI_SIGNING_PRIVATE_KEY` = `cat ~/.tauri/haru.key`
   - `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` = 1단계에서 입력한 비밀번호
   - (선택) macOS 서명: `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`,
     `APPLE_SIGNING_IDENTITY`, `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID`

### 릴리즈 절차

```bash
# 1) 버전 올림
sed -i '' 's/"version": "0.1.0"/"version": "0.2.0"/' packages/desktop/package.json
sed -i '' 's/"version": "0.1.0"/"version": "0.2.0"/' packages/desktop/src-tauri/tauri.conf.json
sed -i '' 's/version = "0.1.0"/version = "0.2.0"/' packages/desktop/src-tauri/Cargo.toml

# 2) 태그 push → 워크플로 자동 트리거
git commit -am "release(desktop): v0.2.0"
git tag v0.2.0
git push origin v0.2.0

# 3) ~ 30분 후 GitHub Releases 에 dmg/msi/deb/appimage + latest.json 자동 게시.
#    기존 사용자 앱은 다음 polling 주기에 업데이트 알림 표시.
```

### 알려진 한계

- **macOS 코드 서명 + 공증 ($99/년)** 없이 배포하면 "확인되지 않은 개발자"
  경고가 뜸. 베타 사용자에게 우클릭 → 열기 안내 필요. 정식 출시 전 Apple
  Developer Program 가입 권장.
- **메뉴바 전용 모드 미설정**: macOS Dock 미표시 menu-bar app 변형은 별도
  `LSUIElement` 설정 필요.
- **글로벌 단축키 미설정**: `tauri-plugin-global-shortcut` 추가 후 `Cmd+Opt+Space`
  같은 시스템-wide hotkey 등록 가능.
