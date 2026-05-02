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

## 모노레포 구조

```
packages/
├─ shared/     공용 타입, 한국어 자연어 날짜 파서, 공휴일·음력 모듈
├─ backend/    NestJS + Prisma + PostgreSQL
├─ web/        Next.js 14 App Router
└─ mobile/     Expo (React Native) + TypeScript
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
