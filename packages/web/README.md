# @haru/web

Next.js 14 App Router · Tailwind · Pretendard.

## 실행

```bash
pnpm install
pnpm dev
```

`http://localhost:3000` → `/today`로 리다이렉트.

## 구조

```
src/
├─ app/
│  ├─ today/         오늘
│  ├─ this-week/     이번주 (한국 특화)
│  ├─ upcoming/      예정
│  ├─ anytime/       언제든지
│  ├─ someday/       언젠가
│  └─ logbook/       로그북
└─ components/
   ├─ sidebar.tsx
   ├─ task-list.tsx
   └─ quick-entry.tsx  ← 한국어 NLP 파서 연계
```
