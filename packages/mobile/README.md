# @haru/mobile

Expo · React Native · NativeWind · expo-router.

## 실행

```bash
pnpm install
pnpm --filter @haru/mobile start    # Metro dev server
pnpm --filter @haru/mobile ios      # iOS 시뮬레이터
pnpm --filter @haru/mobile android  # Android 에뮬레이터
```

백엔드를 같이 띄워야 합니다.

```bash
pnpm --filter @haru/backend prisma:migrate
pnpm --filter @haru/backend prisma:seed     # 데모 계정 demo@haru.app / demo1234!
pnpm --filter @haru/backend dev
```

## API base URL

`EXPO_PUBLIC_API_BASE` 환경 변수로 지정합니다. 미설정 시 Expo Go 호스트
머신의 IP를 자동 감지해 `http://<host-ip>:3001/api` 를 사용합니다.

```bash
EXPO_PUBLIC_API_BASE=http://192.168.0.10:3001/api pnpm start
```

## 인증

- 첫 실행 시 로그인/회원가입 화면 표시
- 액세스/리프레시 토큰은 AsyncStorage 보관
- 401 시 자동 리프레시 1회 재시도

## 구조

```
app/
├─ _layout.tsx        QueryProvider + AuthProvider + Tabs (인증 게이트 포함)
├─ index.tsx          오늘
├─ this-week.tsx      이번주
├─ upcoming.tsx       예정
├─ anytime.tsx        언제든지
└─ someday.tsx        언젠가

components/
├─ Screen.tsx         공통 레이아웃
├─ QuickEntry.tsx     한국어 NLP 입력 → 백엔드 POST
├─ TaskRow.tsx        할 일 행 (완료 토글)
├─ TaskListView.tsx   뷰별 데이터 페칭 + 렌더
└─ LoginScreen.tsx    이메일 로그인/회원가입

lib/
├─ api.ts             REST 클라이언트 + 토큰 관리
├─ auth.tsx           AuthProvider · useAuth
└─ hooks.ts           TanStack Query 훅
```
