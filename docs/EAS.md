# EAS Build · Submit · Update 가이드

Expo Application Services (EAS) 로 모바일 앱을 클라우드 빌드 → 스토어 자동
제출 → OTA 업데이트까지 한 번에 처리합니다. 로컬 Xcode/Android Studio 없이
가능합니다.

## 비용

EAS 무료 플랜:
- iOS / Android 빌드: **30 회/월** (베타 단계 충분)
- EAS Update: **1,000 MAU 무료**, 이후 \$0.10 / 1k MAU
- 큐 우선순위: free 는 medium → 빌드 큐 대기 ~10분 (피크 시간 기준)

초과 시 Pro 플랜 \$19/월 (빌드 무제한 + Priority queue).

## 첫 설정 (한 번만)

### 1) Expo 계정 + 프로젝트

```bash
pnpm dlx eas-cli@latest login
pnpm --filter @haru/mobile exec eas init
# → eas.json 의 projectId 자동 채워짐
# → app.json 의 extra.eas.projectId 자동 갱신
# → app.json 의 updates.url 자동 갱신
```

이때 `app.json` 의 `PROJECT_ID_REPLACE_AFTER_eas_init` 두 군데가 실제
UUID 로 교체됩니다.

### 2) iOS 코드 서명 (자동)

```bash
pnpm --filter @haru/mobile exec eas credentials
# → iOS 선택 → "Set up a new build credentials" → "Generate"
# → Apple Developer 계정으로 로그인 (2FA OTP)
# → EAS 가 인증서/프로필 자동 생성·관리
```

별도 Mac/Xcode 가 필요 없습니다. EAS 가 Apple Developer Portal 과 통신해
적절한 인증서/프로비저닝 프로필을 만들어줍니다.

### 3) Android 키스토어 (자동)

```bash
pnpm --filter @haru/mobile exec eas credentials
# → Android → "Generate new keystore" (한 번 만들면 EAS 가 영구 보관)
```

### 4) 앱스토어 / 플레이 콘솔 등록

iOS — App Store Connect 에서 앱 생성 후 ASC App ID 확인:
```
https://appstoreconnect.apple.com → My Apps → + → New App
  Bundle ID: kr.haru.app
  SKU: haru
  Primary language: Korean
```

Android — Google Play Console 에서 앱 생성 후 service account 발급:
```
https://play.google.com/console → Setup → API access
  → Create new service account → Download JSON
```

다운받은 JSON 파일을 `packages/mobile/google-play-service-account.json` 으로
저장 (gitignore 됨 — 절대 commit 금지).

### 5) GitHub Secrets

저장소 Settings → Secrets and variables → Actions:

| Secret | 용도 |
|---|---|
| `EXPO_TOKEN` | `expo whoami --token` 로 발급. EAS CLI 인증 |
| `APPLE_ID` | App Store Connect 로그인 이메일 |
| `ASC_APP_ID` | App Store Connect → 앱 → App Information → Apple ID |
| `APPLE_TEAM_ID` | Apple Developer → Membership → Team ID |
| `GOOGLE_PLAY_SERVICE_ACCOUNT` | 위 JSON 파일 내용 그대로 (개행 포함) |

## 일상 워크플로

### 개발 빌드 (Expo Go 한계 넘는 native 모듈 테스트용)

```bash
pnpm --filter @haru/mobile build:dev
# → iOS 시뮬레이터용 .app + Android APK 생성
# → expo.dev 에서 다운로드 또는 QR 스캔
```

### 베타 (Internal Testing)

```bash
pnpm --filter @haru/mobile build:preview
# → TestFlight 외부 테스터 + Play Internal Testing track 으로 공유 가능한
#    설치 URL 자동 생성
```

### 프로덕션

```bash
# 1. 버전 번호 확인 (eas.json 의 autoIncrement=true 가 buildNumber 자동 +1)
# 2. 빌드 + 제출
pnpm --filter @haru/mobile build:prod
# 빌드 완료 후 (~20분):
pnpm --filter @haru/mobile submit:prod
# → TestFlight 내부 테스터 자동 배포
# → Google Play "internal" track 자동 업로드 (releaseStatus: draft)
```

GitHub Actions 로도 가능:
```
Actions → "모바일 EAS 빌드" → Run workflow
  profile: production
  platform: all
  submit: ✓
```

### OTA 업데이트 (JS 만 변경)

```bash
pnpm --filter @haru/mobile update:prod -- "버그 수정: QuickEntry 파싱 오류"
# → production 채널 사용자 모두에게 즉시 푸시
# → 다음 콜드 스타트에 새 번들 적용
```

자동: `main` 으로 push 되면 mobile/shared 의 JS 변경에 한해 GitHub Action
(`mobile-update.yml`) 이 자동으로 OTA push.

**OTA 가 불가능한 변경**:
- `package.json` 의 native 의존성 추가/제거 (예: 새 `expo-*` 모듈)
- `app.json` 의 ios/android 설정 변경
- 네이티브 plugin 추가
- `runtimeVersion` 변경

이런 경우 `eas build` 로 새 binary 를 만들고 스토어 심사를 다시 받아야 합니다.

## 첫 출시 체크리스트

- [ ] `eas init` 으로 projectId 받음
- [ ] `eas credentials` 로 iOS/Android 서명 자동 설정
- [ ] App Store Connect 에 앱 등록 + 정보 입력 (`docs/STORE.md` 참고)
- [ ] Google Play Console 에 앱 등록 + 정보 입력
- [ ] 정식 아이콘 + 스크린샷 6컷 × 사이즈별 업로드
- [ ] `pnpm --filter @haru/backend prisma:seed` 로 데모 계정 생성 (심사용)
- [ ] 빌드 → 제출 → TestFlight 내부 테스트 → 외부 테스트 → 정식 심사

## 알려진 한계

- **EAS Free 빌드 30회/월** — Pro 플랜 가입 시 이 한도가 사라집니다 (\$19/월).
- **첫 iOS 빌드는 ~25분** 걸립니다 (큐 + 빌드). 두 번째부터는 캐시로 ~10분.
- **Apple Developer Program (\$99/년)** 가입은 정식 출시 직전까지 미룰 수
  있지만, TestFlight 외부 테스터(최대 10,000명) 를 쓰려면 가입이 필요합니다.
- **Google Play 등록비 \$25 일회성** — Apple 보다 훨씬 저렴.
