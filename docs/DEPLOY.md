# 배포 가이드 — 0원 스택

하루를 **월 운영비 ₩0** 으로 띄우는 완전 무료 티어 조합입니다. 베타 단계의
사용자(< 100명, MAU 기준)까지 안정적으로 커버합니다.

## 권장 스택

| 레이어 | 서비스 | 무료 한도 | 카드 등록 |
|---|---|---|---|
| 웹 (Next.js) | **Vercel Hobby** | 100 GB-시 함수, 무제한 정적 | 불필요 |
| 백엔드 (NestJS) | **Render Free Web Service** | 750h/월 = 1개 always-on, 단 15분 무요청 시 sleep | 불필요 |
| DB (Postgres) | **Neon Free** | 0.5 GB 스토리지, 5분 idle 후 autosuspend | 불필요 |
| 푸시 알림 | **Expo Push** | 무제한 | 불필요 |
| 이메일 (선택) | **Resend Free** | 100건/일 · 도메인 1개 | 불필요 |
| 도메인 | `*.vercel.app` / `*.onrender.com` | 무제한 | 불필요 |
| 모니터링 | Render/Vercel/Neon 내장 + UptimeRobot Free | 50 모니터 | 불필요 |

총 카드 등록 0회. 해외 결제 없음.

## 트레이드오프 (정직)

- **첫 요청 콜드 스타트**: Render 15분 무요청 sleep + Neon 5분 idle suspend
  가 겹치면 첫 요청에 30~60초가 걸립니다. UptimeRobot으로 5분마다 핑을
  쏘면 Render는 깨어 있으나 Neon은 여전히 잘 수 있어 ~1초 정도 추가됩니다.
  베타 사용자에게는 충분합니다.
- **Render 무료는 단일 인스턴스**: 수평 스케일·롤링 배포 불가. 트래픽이
  늘면 Render Starter ($7/월) 또는 Fly.io Hobby로 이전.
- **Neon 0.5 GB**: ~50만개 task 까지 여유. 부족해지면 Pro ($19/월)
  또는 Supabase Free (500MB → Pro $25/월).
- **Vercel 상업적 사용 제한**: 매출 발생 시 Pro ($20/월) 필요. Phase 3
  결제 도입 시점에 업그레이드.

## 배포 단계

### 1) Neon Postgres 생성

1. https://neon.tech 가입 (GitHub OAuth)
2. 새 Project: 리전 `Asia Pacific (Singapore)` (서울에서 가장 가까움)
3. 발급받은 connection string 보관 — `postgres://...:5432/...?sslmode=require`

### 2) 백엔드 배포 (Render)

1. https://render.com 가입
2. New + → **Blueprint** → 이 저장소 연결
3. `render.yaml` 자동 감지, 다음 secret 만 직접 입력:
   - `DATABASE_URL` = Neon에서 복사
   - `JWT_SECRET` = `openssl rand -base64 48` 결과
   - (선택) `KAKAO_CLIENT_ID`, `RESEND_API_KEY`
4. 첫 배포 시 **Shell** 탭에서 한 번 실행:
   ```
   pnpm --filter @haru/backend prisma:migrate deploy
   pnpm --filter @haru/backend prisma:seed
   ```

### 3) 웹 배포 (Vercel)

1. https://vercel.com 가입
2. Import Project → 이 저장소 → Root Directory `packages/web`
3. Build Command: `cd ../.. && pnpm install --frozen-lockfile && pnpm --filter @haru/web build`
4. Output Directory: `.next`
5. Environment Variables:
   - `NEXT_PUBLIC_API_BASE=https://<render-app>.onrender.com/api`
6. Deploy.

### 4) 모바일 (Expo)

EAS Build는 무료 30빌드/월 한도가 있어 v1엔 충분합니다. `expo start` 로컬
개발만으로도 실기기 사용 가능 (Expo Go 앱).

```bash
EXPO_PUBLIC_API_BASE=https://<render-app>.onrender.com/api \
  pnpm --filter @haru/mobile start
```

### 5) UptimeRobot 핑 (선택)

- 5분 간격으로 `GET https://<render-app>.onrender.com/api/health` 호출
- Render free 인스턴스 sleep 방지. Neon은 별도 제어 불가.

## 환경변수 체크리스트

`packages/backend/.env.example` 참고. 운영에 **반드시 필요**:

| 변수 | 용도 |
|---|---|
| `DATABASE_URL` | Neon Postgres 연결 문자열 (`?sslmode=require` 필수) |
| `JWT_SECRET` | 액세스/리프레시 토큰 서명 (256-bit 이상 권장) |
| `CORS_ORIGIN` | 콤마구분 — Vercel URL + 모바일 dev IP |
| `PUBLIC_BASE_URL` | iCal 구독 URL 생성에 사용 (`https://<render>.onrender.com/api`) |
| `WEB_AUTH_REDIRECT` | 카카오 로그인 콜백 후 리디렉트 (예: `https://haru.vercel.app/auth/callback`) |

선택:
- `KAKAO_CLIENT_ID`, `KAKAO_CLIENT_SECRET`, `KAKAO_CALLBACK_URL`
- `GOOGLE_CLIENT_ID`, `NAVER_CLIENT_ID` (캘린더 연동)

## 대안 백엔드: Fly.io

Render free의 sleep이 거슬리면 Fly.io 무료 플랜이 있습니다 (3개의 작은
shared-cpu VM). 카드 등록은 필요하나 **\$0 청구**로 운영 가능 (사용량
초과 시 자동 정지).

```bash
fly launch --copy-config --no-deploy   # fly.toml 생성됨
fly secrets set DATABASE_URL="..." JWT_SECRET="..."
fly deploy
```

## 비용 모니터링 알람

- Neon: Settings → Billing → \$1 초과 시 메일 알림
- Vercel: Settings → Billing → Spend Cap \$0
- Render: Settings → Billing → Notifications

## 백업

무료 티어에서도 다음을 권장합니다.

- **DB**: Neon은 자동 PITR (7일). 추가로 GitHub Actions cron 으로
  주 1회 `pg_dump` → S3 호환 무료 스토리지(예: Cloudflare R2 10GB free).
  본 저장소엔 미포함, Phase 2 후반에 추가 예정.
- **사용자 데이터 내보내기**: 앱 내 `설정 → 계정 → 데이터 내보내기`
  (개인정보보호법 대응) — 향후 구현.

## FAQ

**Q. SSL 인증서?** Render/Vercel/Neon 모두 자동 관리.

**Q. 한국 리전 없는 거 괜찮나?** Singapore 기준 한국에서 평균 80ms RTT.
오프라인 우선 모바일 + 캐시된 Next.js 페이지 조합으로 체감은 빠릅니다.
정식 출시 시점에 AWS Seoul / NCP 로 이전.

**Q. Sleep 후 첫 요청이 너무 느리다면?** 무료 티어의 본질적 한계입니다.
$7/월 Render Starter 가 가장 작은 단계로 always-on을 보장합니다.
