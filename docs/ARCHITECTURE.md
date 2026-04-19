# 시스템 아키텍처 — 하루 (Haru)

## 1. 상위 수준 구성

```
┌────────────────┐   ┌────────────────┐   ┌────────────────┐
│   Mobile (RN)  │   │   Web (Next)   │   │  Watch / Wear  │
└───────┬────────┘   └───────┬────────┘   └───────┬────────┘
        │ HTTPS + WSS        │                    │
        └──────────┬─────────┴────────────────────┘
                   ▼
          ┌────────────────────┐
          │  API Gateway (NCP) │
          └─────────┬──────────┘
                    ▼
          ┌────────────────────┐     ┌─────────────────┐
          │  NestJS (Backend)  │────▶│  Claude API     │
          │  - Auth            │     │  (Opus 4.7)     │
          │  - Tasks           │     └─────────────────┘
          │  - Sync (Yjs)      │
          │  - Webhooks        │
          └────┬────────┬──────┘
               │        │
               ▼        ▼
        ┌──────────┐  ┌──────────┐
        │Postgres  │  │  Redis   │
        └──────────┘  └──────────┘
               │
               ▼
         ┌──────────────┐
         │ NCP Object   │
         │  Storage     │
         └──────────────┘
```

## 2. 모듈 구조 (모노레포)

```
packages/
├─ shared/       도메인 타입, Korean NLP, 공휴일·음력
├─ backend/      NestJS API
├─ web/          Next.js 14 App Router
└─ mobile/       Expo RN + TypeScript
```

### shared 의존성

- `zod` — 스키마 검증
- `date-fns` / `date-fns-tz` — 시간대 안전 처리
- `@haru/korean-calendar` (자체) — 공휴일/음력

### backend 의존성

- `@nestjs/*`, `prisma`, `@prisma/client`
- `passport`, `passport-jwt`, `passport-kakao`
- `bullmq` (큐), `ioredis`
- `@aws-sdk/client-s3` (NCP S3 호환)

### web 의존성

- `next@14`, `react`, `tailwindcss`, `zustand`
- `@tanstack/react-query`, `next-auth`

### mobile 의존성

- `expo`, `expo-router`, `react-native`
- `nativewind`, `react-native-reanimated`
- `@react-native-async-storage/async-storage`

## 3. 동기화 설계

- **로컬 퍼스트**: 모바일은 SQLite(WatermelonDB), 웹은 IndexedDB
- **CRDT**: Yjs 문서를 Area 단위로 생성, `y-websocket`으로 서버 동기화
- **충돌 해결**: CRDT 자동 병합 + 사용자 명시 변경은 `Last-Writer-Wins`
- **오프라인**: 변경 큐를 localDB에 적재 후 온라인 시 배치 전송

## 4. 인증 흐름

```
Mobile/Web → Kakao OAuth → access_token
          → POST /auth/kakao { access_token }
Backend   → Kakao API 검증 → User upsert → JWT (access+refresh)
Mobile/Web 저장: Keychain / SecureStore / httpOnly cookie
```

- **JWT 수명**: access 15분 / refresh 14일 (rolling)
- **로그아웃**: refresh 토큰 블랙리스트 (Redis TTL)

## 5. 푸시 알림

- 백엔드 스케줄러(Bull) → 로컬 타임존으로 변환 → FCM/APNs
- 중요 알림은 **카카오 알림톡** 이중 발송 (사용자 옵트인)
- 조용한 시간 (기본 22:00-07:00) 자동 억제

## 6. 관측성

- **로그**: Pino → Loki
- **메트릭**: Prometheus + Grafana
- **트레이싱**: OpenTelemetry → Tempo
- **에러**: Sentry (PII 마스킹 설정)

## 7. CI/CD

- GitHub Actions
  - `ci.yml`: lint · type · test
  - `backend-deploy.yml`: Docker → NCP Container Registry → Kubernetes
  - `web-deploy.yml`: Vercel (국내 접속은 NCP CloudFront 경유 검토)
  - `mobile-deploy.yml`: EAS Build + TestFlight/Play Internal
