# 하루 (Haru) — 한국형 To-Do 앱

Things 3의 미니멀한 철학을 계승하되, 한국인의 업무·생활·학습 문화에 최적화한 크로스플랫폼 할 일 관리 앱.

> 🇰🇷 iOS · Android · Web · 국내 클라우드 보관

## 문서

- [`docs/PRD.md`](docs/PRD.md) — 제품 요구사항 (기획서)
- [`docs/PRD-SUPPLEMENT.md`](docs/PRD-SUPPLEMENT.md) — 개인정보보호법·접근성·앱스토어 심사 보완
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — 개발 로드맵 상세
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — 시스템 아키텍처
- [`docs/DEPLOY.md`](docs/DEPLOY.md) — **0원 운영비 배포 가이드** (Vercel + Render + Neon)
- [`docs/WIDGETS.md`](docs/WIDGETS.md) — iOS/Android 홈 위젯 가이드
- [`docs/DESKTOP.md`](docs/DESKTOP.md) — macOS · Windows · Linux 데스크톱 (Tauri 2.0)
- [`docs/WATCH.md`](docs/WATCH.md) — Apple Watch · Wear OS 가이드
- [`docs/SHORTCUTS.md`](docs/SHORTCUTS.md) — iOS Shortcuts · Siri · 빅스비 연동
- [`docs/I18N.md`](docs/I18N.md) — 국제화 (ko/ja) + 일본 공휴일 모듈
- [`docs/STORE.md`](docs/STORE.md) — 앱스토어 메타데이터 (한국/일본)
- [`docs/EAS.md`](docs/EAS.md) — EAS Build · Submit · Update 가이드
- [`docs/api/openapi.yaml`](docs/api/openapi.yaml) — 공개 API OpenAPI 3.1 스펙

## 모노레포 구조

```
packages/
├─ shared/     공용 타입, 자연어 파서, 한국·일본 공휴일, sync resolver, i18n
├─ backend/    NestJS + Prisma + PostgreSQL (15개 모듈)
├─ web/        Next.js 14 App Router (Vercel)
├─ mobile/     Expo (React Native) — iOS / Android / iPad / 갤탭 split view
└─ desktop/    Tauri 2.0 — macOS / Windows / Linux (web webview wrapper)
```

## 빠른 시작

```bash
pnpm install
pnpm --filter @haru/backend prisma migrate dev
pnpm dev           # 전체 동시 실행
pnpm --filter @haru/web dev
pnpm --filter @haru/mobile start
```

## 브랜치 전략

- `main` — 배포
- `develop` — 통합
- `claude/*` — Claude Code 작업 브랜치
- `feat/*`, `fix/*` — 일반 피처/버그픽스

## 라이선스

Proprietary. All rights reserved.
