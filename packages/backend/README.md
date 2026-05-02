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

모든 보호 엔드포인트는 `Authorization: Bearer <accessToken>` 헤더가 필요합니다.

| Method | Path | 인증 | 설명 |
|--------|------|------|------|
| GET | `/api/health` | — | 헬스체크 |
| POST | `/api/auth/register` | — | 회원가입 (필수 약관 동의 포함) |
| POST | `/api/auth/login` | — | 이메일/비밀번호 로그인 |
| POST | `/api/auth/refresh` | — | 리프레시 토큰 회전 |
| POST | `/api/auth/logout` | — | 세션 폐기 |
| GET | `/api/auth/me` | ✓ | 내 정보 |
| GET | `/api/auth/kakao` | — | 카카오 로그인 시작 (KAKAO_CLIENT_ID 필요) |
| GET | `/api/auth/kakao/callback` | — | 카카오 OAuth 콜백 |
| GET | `/api/tasks?view=today` | ✓ | 4단 뷰별 할 일 조회 |
| POST | `/api/tasks` | ✓ | 할 일 생성 |
| PATCH | `/api/tasks/:id` | ✓ | 할 일 수정 |
| POST | `/api/tasks/:id/complete` | ✓ | 완료 처리 |
| DELETE | `/api/tasks/:id` | ✓ | 할 일 삭제 |
| GET/POST/PATCH | `/api/areas` | ✓ | 영역 |
| GET/POST | `/api/projects` | ✓ | 프로젝트 |
| POST | `/api/quick-entry/preview` | — | 자연어 파싱 미리보기 |
| POST | `/api/quick-entry` | ✓ | 자연어로 할 일 생성 |
| GET | `/api/calendar/holidays/:year` | — | 공휴일 조회 |

## 환경 변수

```
DATABASE_URL=postgresql://...
JWT_SECRET=change-me-in-production
JWT_ACCESS_TTL=15m
CORS_ORIGIN=http://localhost:3000

# 카카오 OAuth (선택)
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
KAKAO_CALLBACK_URL=http://localhost:3001/api/auth/kakao/callback
WEB_AUTH_REDIRECT=http://localhost:3000/auth/callback
```

## 데모 계정 (시드)

```
이메일:   demo@haru.app
비밀번호: demo1234!
```
