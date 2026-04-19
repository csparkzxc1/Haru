# @haru/mobile

Expo · React Native · NativeWind · expo-router.

## 실행

```bash
pnpm install
pnpm start           # Metro dev server
pnpm ios             # iOS 시뮬레이터
pnpm android         # Android 에뮬레이터
```

## 구조

```
app/
├─ _layout.tsx        하단 탭 내비게이션 (오늘/이번주/예정/언제든지/언젠가)
├─ index.tsx          오늘
├─ this-week.tsx      이번주 (한국 특화)
├─ upcoming.tsx       예정
├─ anytime.tsx        언제든지
└─ someday.tsx        언젠가

components/
├─ Screen.tsx         공통 레이아웃
├─ QuickEntry.tsx     한국어 NLP 입력
└─ TaskRow.tsx        할 일 행
```
