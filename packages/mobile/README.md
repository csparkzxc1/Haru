# @haru/mobile

Expo · React Native · NativeWind · expo-router · expo-sqlite · expo-notifications.

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

## 오프라인 동기화

모든 읽기/쓰기는 로컬 SQLite 캐시(`haru.db`)를 거칩니다.

* **읽기**: `useTasks(view)` 가 `tasks` 테이블에서 즉시 결과를 반환하고
  백그라운드에서 `syncNow()` 를 호출합니다.
* **쓰기**: 즉시 로컬에 적용 + `outbox` 큐에 변형 기록 → 다음 sync 시 일괄
  push. 네트워크 단절 시 큐에 머무릅니다.
* **충돌**: 서버는 LWW (last-writer-wins) 판정자. push 응답에서
  `ignored` 인 항목은 다음 pull 에서 서버 값으로 덮어씌워집니다.
* **삭제**: 소프트 삭제. 다른 기기는 pull 시 `deletedAt` 필드로 인지합니다.

워터마크는 `meta.sync.lastPullAt` 키에 저장되며, 각 pull 이후 서버 시각
으로 갱신됩니다.

## 푸시 알림

* **로컬 알림**: 예정 시각이 있는 task가 생성/수정될 때마다
  `Notifications.scheduleNotificationAsync` 로 OS 단에 직접 등록.
  네트워크 없이도 동작합니다.
* **원격 푸시**: 첫 로그인 시 Expo Push Token 을 발급받아
  `POST /notifications/devices` 로 백엔드에 등록. 백엔드의
  `NotificationsService.sendToUser()` 가 향후 트리거에서 활용합니다.

## 구조

```
app/
├─ _layout.tsx        QueryProvider + AuthProvider + AuthedShell (DB init / sync / notifications)
├─ index.tsx          오늘
├─ this-week.tsx      이번주
├─ upcoming.tsx       예정
├─ anytime.tsx        언제든지
└─ someday.tsx        언젠가

components/
├─ Screen.tsx
├─ QuickEntry.tsx     자연어 입력 → 로컬 DB + outbox
├─ TaskRow.tsx        dirty 표시 포함
├─ TaskListView.tsx   로컬 DB 페치
└─ LoginScreen.tsx

lib/
├─ api.ts             REST 클라이언트 + 토큰 관리
├─ auth.tsx           AuthProvider (logout 시 onLogout 훅)
├─ db.ts              expo-sqlite 스키마 + outbox + meta KV
├─ sync.ts            동기화 엔진 (flushOutbox + pullChanges)
├─ notifications.ts   푸시 토큰 등록 + 로컬 알림 동기화
└─ hooks.ts           TanStack Query 훅 (로컬 DB 기반)
```
