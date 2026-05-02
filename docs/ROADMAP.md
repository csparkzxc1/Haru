# 개발 로드맵 — 하루 (Haru)

## Phase 1: MVP (M0 ~ M3)

**목표**: 국내 베타 출시, 핵심 사용자 경험 확보

- [x] 모노레포 스캐폴딩 (shared / backend / web / mobile)
- [x] 한국어 자연어 날짜 파서
- [x] 한국 공휴일 + 음력 모듈
- [x] 데이터 모델: User, Area, Project, Task, Tag, Checklist (Prisma)
- [x] 인증: 이메일/JWT (액세스 + 리프레시 회전) · 카카오 OAuth 스캐폴딩
- [x] 4단 뷰 UI (Today / This Week / Upcoming / Anytime / Someday / Logbook / Inbox)
- [x] Quick Entry (자연어 파싱 입력) — 백엔드 연동 완료
- [x] 오프라인 동기화 (SQLite + Push-Pull) — 모바일 LWW · outbox · 워터마크
- [x] 푸시 알림 (Expo Push 토큰 등록 + 로컬 알림 스케줄링)
- [x] 개인정보 처리방침 · 약관 페이지 (웹)

## Phase 2: 성장 (M3 ~ M6)

- [~] 네이버 캘린더 · 구글 캘린더 양방향 동기화 *(iCal export 완료, OAuth 스텁만)*
- [x] 카카오톡 공유 (시스템 공유 시트 경유 — 카카오 SDK 정식 통합은 Phase 2 후반)
- [~] 홈 위젯 (오늘 / D-Day / 진행률) *(데이터 엔드포인트 + 가이드 문서, 네이티브 코드 TODO)*
- [x] 가족 공유 Area + 초대 플로우 (토큰 7일 유효, 멤버 권한 가드)
- [x] 경조사 · 축의금 매니저 (연도별 합계, 보냄/받음/순지출, 9가지 종류)
- [x] 다크모드 완성 · 시니어 모드 (웹+모바일 토글, 큰 글자/큰 버튼)
- [ ] 베타 → 정식 출시 (앱스토어 · 플레이 · 원스토어)

## Phase 3: 확장 (M6 ~ M9)

- [ ] AI 어시스턴트 (Claude Opus 4.7)
  - 오늘 할 일 자동 정리
  - 주간 회고 생성
  - 자연어 → 프로젝트 분해
- [ ] B2B 팀 플랜 (세금계산서 · 권한 관리)
- [ ] 에브리타임 시간표 임포트
- [ ] 인강 플랫폼 북마크 확장 (크롬)
- [ ] 웹앱 정식 출시
- [ ] 공개 API + Zapier/Make 커넥터

## Phase 4: 플랫폼 (M9 ~ M12)

- [ ] Apple Watch · Wear OS 앱
- [ ] iPad · 갤럭시 탭 최적화 (Split View)
- [ ] macOS · Windows 네이티브 데스크톱 (Tauri)
- [ ] Shortcuts / 빠른 명령 연동
- [ ] Siri · 빅스비 연동 검토
- [ ] 국외 확장: 일본 (재일동포 수요)

## 지속 운영 트랙

- 매 스프린트: 접근성 1건 개선 + 성능 1건 최적화
- 분기 1회: 보안 감사 · 침투 테스트
- 연 1회: PRD 재검토 · 페르소나 재조사
