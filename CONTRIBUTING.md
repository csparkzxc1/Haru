# 기여 가이드

## 커밋 메시지

한국어 또는 영어. 컨벤션 커밋 권장.

```
feat(mobile): 오늘 뷰에 공휴일 배지 추가
fix(backend): 태그 업서트 경합 수정
docs(prd): 접근성 섹션 보완
```

## 브랜치

- `feat/<이슈-요약>` — 피처
- `fix/<이슈-요약>` — 버그
- `claude/<설명>` — Claude Code 작업
- `chore/*`, `docs/*`, `refactor/*`

## PR 체크리스트

- [ ] `pnpm typecheck` 통과
- [ ] `pnpm test` 통과
- [ ] 사용자 영향이 있는 변경이면 스크린샷 첨부
- [ ] 개인정보 처리 로직 추가 시 `docs/PRD-SUPPLEMENT.md` 참조 사항 업데이트

## 코드 스타일

- TypeScript strict
- 함수형 스타일 우선 · 클래스는 NestJS DI 한정
- 한국어 주석 허용. 도메인 용어(Area, Project, Task 등)는 원문 유지.
