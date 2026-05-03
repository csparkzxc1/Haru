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
| GET | `/api/sync/pull?since=<iso>` | ✓ | 변경 피드 (since 이후 변경된 task) |
| POST | `/api/sync/push` | ✓ | 오프라인 변형 일괄 적용 |
| POST | `/api/notifications/devices` | ✓ | Expo Push 토큰 등록 |
| DELETE | `/api/notifications/devices` | ✓ | 토큰 해지 |
| POST | `/api/areas/:id/invites` | ✓ | 영역 초대 토큰 발급 (7일) |
| POST | `/api/areas/invites/accept` | ✓ | 초대 수락 (멤버 합류) |
| GET | `/api/areas/:id/members` | ✓ | 멤버 목록 |
| GET/POST/PATCH/DELETE | `/api/family-events` | ✓ | 경조사·축의금 매니저 |
| GET | `/api/family-events/stats/:year` | ✓ | 연간 통계 (보냄/받음/순지출) |
| GET | `/api/calendar/ics` | token | iCal 내보내기 (외부 캘린더 구독용) |
| GET | `/api/calendar/subscribe-token` | ✓ | 1년짜리 long-lived 구독 토큰 |
| GET | `/api/widgets/today` | ✓ | 홈 위젯 — 오늘 요약 |
| GET | `/api/widgets/dday` | ✓ | 홈 위젯 — D-Day 3건 |
| GET | `/api/data/export` | ✓ | 전체 사용자 데이터 JSON 다운로드 (개인정보보호법 35조) |
| DELETE | `/api/data/account` | ✓ | 회원 탈퇴 (소프트 삭제, 7일 유예) |
| POST | `/api/ai/today/organize` | ✓ | AI — 오늘 할 일 자동 정리 |
| POST | `/api/ai/weekly-review` | ✓ | AI — 주간 회고 생성 |
| POST | `/api/ai/decompose` | ✓ | AI — 자연어 → sub-task 분해 |
| GET/POST | `/api/workspaces` | ✓ | B2B 팀 워크스페이스 |
| GET/POST/DELETE | `/api/workspaces/:id/members` | ✓ | 멤버 관리 (이메일 기반 추가) |
| GET | `/api/workspaces/:id/invoices` | ✓ | 세금계산서 조회 |
| GET/POST/DELETE | `/api/api-keys` | ✓ | 외부 API 키 발급/해지 (Bearer haru_ak_…) |
| GET | `/api/watch/today` | ✓ | Apple Watch / Wear OS — 오늘 요약 (< 1KB, 단축 키) |
| POST | `/api/watch/complete` | ✓ | Watch — 단일 task 완료 (low-latency) |

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
