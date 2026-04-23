# Phase 3 설계 문서 — Area & Project

> 작성일: 2026-04-23  
> 목적: Haru 앱의 계층 구조 (Area + Project) 추가를 위한 상세 설계  
> 상태: 기획 완료, 구현 대기 중

---

## 🎯 Haru 프로젝트 정체성

**"Things 3 감성 + 한국어 네이티브"**

- 타겟: 한국 직장인 (25~40)
- 차별점:
  - 한국어 자연어 입력
  - Things 3급 감성 디자인
  - 한국 공휴일/요일 자동 인식
  - 카카오 로그인
- 포기할 것: 팀 협업, 웹 버전, 게임화

---

## 📐 계층 구조 결정

**중간 복잡도** 선택: Area + Project (Heading 없음)

```
Area (영역)
├── Project (프로젝트)
│   ├── Task
│   └── Task
└── Task (영역 직속)

Task (미분류, area/project 모두 없음)
```

**Heading은 제외** — Things 3의 완전 복잡함은 오버킬.

---

## 📦 1. Area (영역)

### 필드 설계

| 필드 | 필수 | 타입 | 설명 |
|---|---|---|---|
| `id` | ✅ | string (UUID) | 고유 식별자 |
| `name` | ✅ | string | 영역 이름 (1~20자) |
| `emoji` | ❌ | string | 시각 표현 |
| `color` | ❌ | string (토큰) | 색상 토큰명 |
| `order` | ✅ | number | 정렬 순서 |
| `createdAt` | ✅ | string (ISO 8601) | 생성 시각 |
| `hidden` | ❌ | boolean | 아카이브 여부 |

### 색상 토큰

```
teal     → #4FB3BF  (회사 기본)
orange   → #E04E2A  (개인 기본, 브랜드)
green    → #5CB85C  (취미 기본)
purple   → #9333EA  
amber    → #F59E0B
rose     → #E11D48
slate    → #64748B
```

**토큰 방식 채택 이유**: 다크모드 자동, 중앙 관리, 일관성.

### 설계 결정

- **ID**: UUID 사용 (백엔드 호환 + 안전)
- **color**: 토큰명으로 저장 (HEX 직접 X)
- **order**: 필드로 명시 (배열 순서 의존 X, 다중기기 동기화 대비)
- **hidden**: 삭제 대신 숨김 플래그 (데이터 보존)

### 엣지 케이스

1. **영역 삭제 시 내부 프로젝트**:  
   → 프로젝트의 `areaId = null` (독립 프로젝트로 전환)  
   → 연쇄 삭제 X (데이터 보존)

2. **영역 이름 중복 허용**:  
   → 에러 X, 경고 확인 후 진행

3. **최소 영역 개수**: 0 (다 지울 수 있음)

4. **이름 제한**: 1~20자, 이모지 최대 1개

---

## 📋 2. Project (프로젝트)

### 필드 설계

| 필드 | 필수 | 타입 | 설명 |
|---|---|---|---|
| `id` | ✅ | string (UUID) | 고유 식별자 |
| `name` | ✅ | string | 프로젝트명 |
| `areaId` | ❌ | string \| null | 소속 영역 |
| `emoji` | ❌ | string | 아이콘 (기본 "📋") |
| `when` | ❌ | string \| null | 시작 예정일 |
| `deadline` | ❌ | string \| null | 마감일 |
| `note` | ❌ | string | 설명 메모 |
| `done` | ❌ | boolean | 완료 여부 |
| `doneAt` | ❌ | string \| null | 완료 시각 |
| `order` | ✅ | number | 영역 내 정렬 |
| `createdAt` | ✅ | string | 생성 시각 |

### 설계 결정

- **areaId nullable**: 독립 프로젝트 허용 (Things 3 방식)
- **프로젝트 고유 색 없음**: 속한 영역 색을 상속 (단순성)
- **진행률**: 실시간 계산, 필드로 저장 X (파생값)
- **완료 조건**: 반자동 — 모든 할 일 완료 시 "완료하시겠어요?" 팝업
- **when vs deadline**:
  - `when` = 시작/진행 예정일 (오늘 탭 표시 기준)
  - `deadline` = 마감일 (경고 색 표시)

### 엣지 케이스

1. **프로젝트 삭제 옵션** (Alert):
   ```
   - 취소
   - 할 일 유지 (미분류로 이동)
   - 모두 삭제 (destructive)
   ```

2. **영역 삭제 시**:  
   → 프로젝트의 `areaId = null`  
   → 사이드바 루트에 표시

3. **프로젝트 다른 영역 이동**:  
   → `project.areaId`만 변경  
   → 안의 할 일은 자동 따라감

---

## 🗂️ 3. Task 업데이트

### 기존 필드 재사용

```typescript
areaId?: string | null;
projectId?: string | null;
```

### 두 가지 패턴

**패턴 1: 영역 직속 할 일**
```
task.areaId = "area_work"
task.projectId = null
```

**패턴 2: 프로젝트 소속 할 일**
```
task.areaId = null (derived from project)
task.projectId = "proj_q2_report"
```

### "회사 영역의 모든 할 일" 쿼리

```
조건:
  task.areaId === "area_work"
    OR
  (task.projectId !== null 
   AND project(task.projectId).areaId === "area_work")
```

---

## 🏗️ 4. 엔티티 관계도

```
Area 1 ─── N Project
   ↑           ↑
   │ areaId    │ projectId
   │           │
   └──── Task ─┘
     (선택 관계)
```

- Area 1 : N Project
- Area 1 : N Task (직접)
- Project 1 : N Task
- Task N : 1 Project (선택)
- Task N : 1 Area (선택, project 통해 또는 직접)

---

## 💾 5. 상태 관리

### 스토어 분리

```
store/areas.ts      → Area CRUD
store/projects.ts   → Project CRUD
store/tasks.ts      → Task CRUD (기존, 업데이트)
```

**분리 이유**:
- 관심사 분리
- 리렌더 최적화
- 백엔드 API 엔드포인트별 매핑

### 액션 목록

**areas 스토어**:
- `addArea(name, emoji?, color?)`
- `updateArea(id, patch)`
- `deleteArea(id, mode: "cascade" | "orphan")`
- `reorderAreas(newOrder[])`
- `hideArea(id)` / `showArea(id)`

**projects 스토어**:
- `addProject(name, areaId?, patch?)`
- `updateProject(id, patch)`
- `deleteProject(id, taskMode: "keep" | "delete")`
- `moveProject(id, newAreaId)`
- `completeProject(id)`
- `reorderProjects(areaId, newOrder[])`

**tasks 스토어 추가**:
- `assignToProject(taskId, projectId)`
- `assignToArea(taskId, areaId)`
- `unassign(taskId)`

---

## 🎯 6. Derived/Computed 값

UI에서 `useMemo`로 계산:

```typescript
progress(projectId) → { total, completed, percent }
projectCount(areaId) → number
activeTaskCount(areaId) → number
tasksByArea(areaId) → { directTasks, byProject }
```

---

## 🎨 7. UI 화면 구조

### 사이드바 (Drawer)

```
📋 시스템
  ☀ 오늘
  🗓 이번주
  📆 예정
  🌊 언제든지
  ✨ 언젠가

💼 회사
  📊 Q2 보고서
  📋 신제품 출시

🏠 개인
  💰 재테크 관리
  🎯 2026 목표

🌱 취미
  (프로젝트 없음)

━━━━━━━━━
📓 로그북
🗑️ 휴지통

[+ 새 영역]
```

### 영역 상세 화면

- 이름/이모지 편집
- 프로젝트 목록
- 미분류 할 일 (직속)
- "새 프로젝트" 버튼

### 프로젝트 상세 화면

- 이름/이모지 편집
- 진행률 바 (자동 계산)
- 마감일
- 메모
- 할 일 목록
- 빠른 추가
- 삭제 옵션 (옵션 3가지)

---

## 🧪 8. 초기 템플릿 (첫 앱 실행)

### 기본 영역 3개

```
area_personal  🏠 개인    orange  order=1
area_work      💼 회사    teal    order=2
area_hobby     🌱 취미    green   order=3
```

### 기본 프로젝트 2개

```
project_finance
  areaId: area_personal
  name: "재테크 관리"
  emoji: "💰"
  note: "월 결산, 투자 일지 등을 여기에 기록"

project_goals
  areaId: area_personal
  name: "2026 목표"
  emoji: "🎯"
  deadline: "2026-12-31"
  note: "올해 달성하고 싶은 목표 정리"
```

### 기존 18개 더미 재분류

(Day 4 구현 시 수동 배정)

---

## 🚨 9. 위험 포인트

### 위험 1: 데이터 마이그레이션

- 현재: 더미 데이터 18개 (영역/프로젝트 없음)
- 대응: 초기 템플릿 생성 후 수동 배정
- 실제 사용자: Phase 4(AsyncStorage)에서 마이그레이션 로직

### 위험 2: Zustand 순환 참조

- 스토어 간 직접 참조 X
- 계산은 컴포넌트 레이어 `useMemo`

### 위험 3: order 필드 관리

- drag-drop 시 복잡함
- 일단 배열 순서대로 (Phase 3 마감 시)
- drag-drop은 Phase 3 후반 or Phase 4로

---

## 📅 10. 구현 일정

### Day 4 (Phase 3-A): 데이터 레이어 (4시간)

- [ ] `types/area.ts` 작성
- [ ] `types/project.ts` 작성
- [ ] `types/task.ts` 업데이트
- [ ] `store/areas.ts` CRUD
- [ ] `store/projects.ts` CRUD
- [ ] 초기 템플릿 데이터
- [ ] 기존 더미 할 일 재분류
- [ ] 커밋 3~5개

### Day 5 (Phase 3-B): 사이드바 (6시간)

- [ ] Drawer Navigation 셋업 (expo-router)
- [ ] 사이드바 UI 구현
- [ ] 영역별 그룹핑 표시
- [ ] 프로젝트 목록
- [ ] 탭 네비게이션 (영역/프로젝트 상세)
- [ ] 커밋 3~5개

### Day 6 (Phase 3-C): 상세 화면 (6시간)

- [ ] `app/area/[id].tsx` 구현
- [ ] `app/project/[id].tsx` 구현
- [ ] 진행률 바
- [ ] 이름/이모지 편집
- [ ] 할 일 필터링
- [ ] 빠른 추가
- [ ] 커밋 3~5개

### Day 7 (Phase 3-D): 연결 + 마무리 (4시간)

- [ ] Task 상세에 프로젝트 선택기
- [ ] 영역/프로젝트 변경 플로우
- [ ] 삭제 Alert
- [ ] 빈 상태 UI
- [ ] 애니메이션
- [ ] 타입 체크 0 errors 유지
- [ ] 최종 커밋 2~3개

**Phase 3 총: 약 4일, 커밋 13~18개**

---

## 🎨 11. 디자인 원칙

### 색상 활용

- 영역마다 색 배정 (중앙 토큰)
- 프로젝트는 영역 색 상속
- 할 일 리스트에 얇은 색띠 (좌측)
- 다크모드 대응

### 타이포그래피

- Pretendard (한국어 최적화)
- 제목: Semibold tracking-tight
- 본문: Regular
- 숫자: Medium (가독성)

### 간격

- 행 높이 44~48px
- 여백 padding 16~24
- Things 3 스타일 (여유)

---

## ✅ 12. Phase 3 완료 조건

- [ ] 영역 추가/편집/삭제 가능
- [ ] 프로젝트 추가/편집/삭제 가능
- [ ] 할 일 → 프로젝트 지정 가능
- [ ] 사이드바에서 영역/프로젝트 탐색
- [ ] 진행률 표시
- [ ] 타입 체크 0 errors
- [ ] 18~25 커밋 쌓임

---

## 🔮 Phase 4~ 미리보기

- Phase 4: AsyncStorage 영구 저장 (새로고침 해도 데이터 유지)
- Phase 5: Supabase 백엔드 + 동기화
- Phase 6: 카카오 로그인
- Phase 7: 알림 + iOS 위젯
- Phase 8: 애니메이션 정교화
- Phase 9: TestFlight 베타
- Phase 10: App Store 런칭

---

> 이 문서는 2026-04-23 기획 세션의 결과물입니다.  
> Day 4부터 이 문서를 참조하여 구현을 진행합니다.
