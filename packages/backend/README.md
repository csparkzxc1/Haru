# @haru/backend

NestJS + Prisma + PostgreSQL.

## 실행

```bash
cp .env.example .env
pnpm install
pnpm --filter @haru/backend prisma:migrate
pnpm --filter @haru/backend prisma:seed   # 데모 사용자(00000000-...-001) + 영역 2개
pnpm --filter @haru/backend dev
```

> 시드는 웹 클라이언트가 보내는 `x-user-id` 헤더(`00000000-0000-0000-0000-000000000001`)와
> 매칭되는 데모 User 한 명을 보장합니다. 인증 도입 전 개발 단계에서만 사용합니다.

## API 개요

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/health` | 헬스체크 |
| GET | `/api/tasks?view=today` | 4단 뷰별 할 일 조회 |
| POST | `/api/tasks` | 할 일 생성 |
| PATCH | `/api/tasks/:id` | 할 일 수정 |
| POST | `/api/tasks/:id/complete` | 완료 처리 |
| GET | `/api/areas` | 영역 목록 |
| POST | `/api/areas` | 영역 생성 |
| GET | `/api/projects` | 프로젝트 목록 |
| POST | `/api/quick-entry/preview` | 자연어 파싱 미리보기 |
| POST | `/api/quick-entry` | 자연어로 할 일 생성 |
| GET | `/api/calendar/holidays/:year` | 공휴일 조회 |

> v1 단계: 인증은 `x-user-id` 헤더로 간소화. Phase 1 후반부에 Kakao OAuth + JWT로 교체.
