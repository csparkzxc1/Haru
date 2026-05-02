# 예상 앱 화면 목업

세 가지 버전의 목업이 있습니다. **v3 가 가장 최신 + 실제 코드 기반**입니다.

| 버전 | 진입점 | 설명 |
|---|---|---|
| **v3 (코드 기반)** | [`v3-from-code/index.html`](v3-from-code/index.html) | 실제 구현된 React 컴포넌트 (`packages/web/src/components/*`, `packages/mobile/components/*`) 의 Tailwind 클래스를 1:1 재현. 9개 화면. |
| v2 | [`haru-mockup-v2.html`](haru-mockup-v2.html) | 디자인 탐색 — 한 페이지 전체 (1417줄) |
| v1 | [`v1.html`](v1.html) | 초기 컨셉 — 6개 화면 |
| 허브 | [`index.html`](index.html) | v1/v2 선택 페이지 |

## v3 내용

### 웹 (Next.js)

| 화면 | 포커스 |
|---|---|
| `web-login.html` | 로그인 + 카카오 OAuth + 데모 자격증명 프리필 |
| `web-today.html` | QuickEntry 파싱 미리보기 + TaskList (체크/취소선/삭제 호버) |
| `web-this-week.html` | 한국 직장인 뷰 + 공휴일 표시 (어린이날·근로자의 날·부처님오신날) |
| `web-areas.html` | 가족 영역 + 7일 유효 초대 토큰 + 카카오톡 공유 |
| `web-family-events.html` | 경조사 매니저 — 연간 통계 3장 + 인라인 추가 폼 |
| `web-ai-organize.html` | AI 오늘 정리 — Claude Sonnet 4.6 결과 (DEEP_WORK / QUICK_WIN / MEETING / ERRAND) |
| `web-settings.html` | 다크/시니어 모드 + 데이터 내보내기 + iCal 구독 + API 키 |

### 모바일 (Expo + NativeWind)

| 화면 | 포커스 |
|---|---|
| `mobile-today.html` | 아이폰 14 Pro 프레임 · 오늘 + 설정 (옆에 나란히) · dirty(⏳) 인디케이터 |
| `mobile-quick-entry.html` | 자연어 파싱 — 데드라인 마커 / 음력 추석 인식 |

## 실행

```bash
# macOS
open docs/mockups/v3-from-code/index.html
# Linux
xdg-open docs/mockups/v3-from-code/index.html
# 또는 정적 서버 — 호스팅 시 그대로 배포 가능
npx serve docs/mockups/v3-from-code
```

## 디자인 토큰 (`packages/web/tailwind.config.ts` 와 동일)

| 토큰 | 값 | 용도 |
|------|-----|------|
| `haru-ink` | `#1C1C1E` | 본문 |
| `haru-paper` | `#FAFAF7` | 배경 (라이트) |
| `haru-accent` | `#FF6B35` | 강조 · 체크 · 버튼 |
| `haru-muted` | `#8E8E93` | 보조 텍스트 |
| 폰트 | Pretendard | 본문 |
| 자간 | `-0.01em` | 한글 최적화 |

## v3 가 v1/v2 와 다른 점

- 색상·간격·자간이 **실제 빌드된 앱과 동일**합니다 — 새로 칠한 게 아니라 `tailwind.config.ts` 의 토큰을 그대로 import.
- 사이드바 / TaskRow / QuickEntry 마크업이 React 컴포넌트의 JSX 구조와 1:1 대응합니다 (가벼운 sed/regex 로 React로 옮길 수 있습니다).
- 시스템 전체에서 일관된 sidebar 셸을 사용하기 위해 `_shell.js` 가 한 번만 로드됩니다.
