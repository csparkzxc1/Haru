# 앱스토어 출시 자료

본 문서는 App Store Connect / Google Play Console / 원스토어 / 일본 App Store
출시 신청에 필요한 모든 메타데이터를 한 곳에 모아 둡니다. 각 스토어의
관리 콘솔에 그대로 복사해 넣으면 됩니다.

## 공통

| 항목 | 값 |
|---|---|
| 앱 이름 | 하루 (Haru) |
| 번들 ID (iOS) | `kr.haru.app` |
| 패키지명 (Android) | `kr.haru.app` |
| 카테고리 | 생산성 |
| 콘텐츠 등급 | 전체 이용가 (4+) |
| 가격 | 무료 (인앱 결제 — Pro/Team 플랜) |

## 한국어 (ko-KR)

### 앱 이름 (최대 30자)
하루 — 한국형 To-Do

### 부제 (Subtitle, iOS, 30자)
미니멀한 할 일, 한국의 문화로

### 프로모션 텍스트 (170자)
"내일 오후 3시 팀 회의 #회의" 한 줄로 입력 끝. 음력 생일·공휴일·경조사까지 챙겨주는 한국형 할 일 앱.

### 설명문 (4,000자)
```
Things 3의 미니멀한 철학을 그대로 가져오되, 한국인의 일상에 꼭 맞춘 할 일 관리 앱입니다.

✦ 한국어 자연어로 한 줄 입력
"내일 오후 3시 팀 회의 #회의 !"
"다음 주 금요일까지 보고서 마감"
"3월 1일 어머님 생신 (음력)"
입력만 하면 날짜·시각·태그·우선순위가 자동으로 분리됩니다.

✦ 한국 공휴일 + 음력 자동 인식
설날·추석 같은 음력 공휴일은 물론 부모님 생신·제사·결혼기념일을 음력으로 등록할 수 있습니다. 매년 자동으로 정확한 날짜에 알립니다.

✦ 4단 뷰 — 오늘·이번주·예정·언제든지
한국 직장인을 위한 "이번주" 뷰. 월~일을 한눈에. 공휴일 표시 포함.

✦ 가족·팀 공유
영역(Area)을 가족·팀과 공유하세요. 7일 유효한 초대 링크를 카카오톡으로 한 번 보내면 끝.

✦ 경조사·축의금 매니저
결혼·장례·생일·돌·집들이… 한국 직장 생활에 빠질 수 없는 경조사를 한 곳에. 보낸 금액·받은 금액·연간 합계 자동 집계.

✦ 시니어 모드
부모님 세대를 위한 큰 글자·큰 버튼 모드 내장.

✦ 오프라인 우선
SQLite 로컬 캐시. 지하철에서도 끊김 없이. 온라인 복귀 시 자동 동기화.

✦ 국내 클라우드
모든 데이터는 국내 리전(예정)에 저장됩니다. 개인정보보호법 완전 준수, 언제든 JSON 으로 내보내기·탈퇴 가능.

✦ 외부 캘린더 구독
구글·네이버 캘린더, 아이폰 캘린더에서 하루를 읽기 전용으로 구독할 수 있습니다.

지원 플랫폼: iOS 16+, Android 8+, 웹
지원 언어: 한국어, 일본어 (예정)
```

### 키워드 (iOS, 100자)
```
할일,투두,할일관리,일정,스케줄,플래너,GTD,things,업무,학습,생산성,한국,음력,공휴일
```

### 신규 기능 (What's New)
```
v0.1.0 — 첫 출시
• 한국어 자연어 입력 ("내일 오후 3시 회의 #회의")
• 4단 뷰 (오늘·이번주·예정·언제든지·언젠가)
• 한국 공휴일 + 음력 지원
• 가족 영역 공유 + 카카오톡 초대
• 경조사·축의금 매니저
• 오프라인 동기화
• 다크모드 + 시니어 모드
```

## 일본어 (ja-JP)

### 앱 이름
ハル — 韓国式 To-Do

### 부제
ミニマルなタスク管理、韓国の生活文化と共に

### 설명문 (요약)
```
Things 3のミニマルな哲学を継承し、韓国の生活文化に最適化したタスク管理アプリ。

✦ 韓国語 + 日本語の自然言語入力
✦ 旧暦・祝日対応
✦ 家族・チーム共有 (LINE/カカオトーク)
✦ 慶弔費マネージャー
✦ オフライン優先
✦ シニアモード搭載

iOS 16+ · Android 8+ · Web
```

## 심사 대응

### Apple — App Privacy

| 항목 | 수집 여부 | 사용 목적 | 식별 |
|---|---|---|---|
| 이메일 | ✓ | 계정 관리, 푸시, 고객 응대 | 사용자 식별 |
| 닉네임 | ✓ | 화면 표시 | 사용자 식별 |
| 대략적 위치 | ✗ | — | — |
| 정확한 위치 | ✗ | — | — |
| 식별자 (광고/계정) | ✓ | 계정 식별만 (광고 X) | 사용자 식별 |
| 사용 데이터 | ✗ | — | — |
| 진단 | ✓ | 충돌 로그 | 식별 안 함 |

광고 추적 없음. 제3자 SDK 없음 (Expo 자체만).

### iOS Privacy Manifest (PrivacyInfo.xcprivacy)

`packages/mobile/ios/PrivacyInfo.xcprivacy` 에 추가 (eas build 시 적용):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>NSPrivacyTracking</key>
  <false/>
  <key>NSPrivacyCollectedDataTypes</key>
  <array>
    <dict>
      <key>NSPrivacyCollectedDataType</key>
      <string>NSPrivacyCollectedDataTypeEmailAddress</string>
      <key>NSPrivacyCollectedDataTypeLinked</key>
      <true/>
      <key>NSPrivacyCollectedDataTypeTracking</key>
      <false/>
      <key>NSPrivacyCollectedDataTypePurposes</key>
      <array>
        <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
      </array>
    </dict>
  </array>
  <key>NSPrivacyAccessedAPITypes</key>
  <array>
    <dict>
      <key>NSPrivacyAccessedAPIType</key>
      <string>NSPrivacyAccessedAPICategoryUserDefaults</string>
      <key>NSPrivacyAccessedAPITypeReasons</key>
      <array>
        <string>CA92.1</string>
      </array>
    </dict>
  </array>
</dict>
</plist>
```

### Google Play — Data safety

| 데이터 유형 | 수집 | 공유 | 암호화 | 사용자 삭제 가능 |
|---|---|---|---|---|
| 이메일 | ✓ | ✗ | TLS+AES-256 | ✓ (앱 내 탈퇴) |
| 사용자 콘텐츠 (할 일) | ✓ | ✗ | TLS+AES-256 | ✓ |
| 디바이스 ID | ✓ | ✗ | TLS+AES-256 | ✓ |

### 원스토어

원스토어는 한국 사업자번호 필수. 추후 개인사업자 등록 후 진행.

### 한국 모바일 앱 보안 요구사항

- ✓ HTTPS 전송 (TLS 1.3)
- ✓ 앱 내 비밀번호 8자 이상
- ✓ 자동 로그아웃 (액세스 토큰 15분, 리프레시 30일)
- ✓ 개인정보 처리방침 앱 내 노출 (`/privacy`)
- ✓ 회원 탈퇴 즉시 처리 (소프트 삭제 + 7일 유예)
- ☐ 본인 확인 — 14세 미만 가입 차단 UI 추가 필요 (Phase 2 후반)
- ☐ 광고 추적 동의 (광고 미도입으로 미해당)

## 스크린샷 스펙

각 스토어가 요구하는 사이즈와 컷 수:

### iPhone (App Store)
- 6.7": 1290 × 2796 (필수)
- 6.5": 1284 × 2778 (선택)
- 최소 3컷, 권장 6컷

### Android (Play Store)
- 1080 × 1920 또는 1080 × 2400
- 최소 2컷, 권장 8컷

### 권장 컷 (모두 한국어 위주, 다크모드 1컷 포함)

1. **오늘** — 자연어 입력창 + 파싱 미리보기 ("내일 오후 3시 팀 회의 #회의")
2. **이번주** — 한국 직장인 뷰 + 공휴일 표시
3. **경조사 매니저** — 연간 합계 카드 3개 + 항목 리스트
4. **가족 공유** — 영역 + 멤버 + 카카오톡 초대 버튼
5. **다크모드 / 시니어 모드** — 큰 글자 비교 컷
6. **로컬 알림** — OS 알림 미리보기

스크린샷 자동 생성은 Phase 2 후반 — Detox + scrnli 또는 fastlane snapshot
도입 예정. v1 베타는 수동 캡처.

## 앱 아이콘

`packages/mobile/assets/icon.png` (1024×1024). 디자인 가이드:

- 배경: `#FAFAF7` (haru-paper) 또는 `#1C1C1E` (haru-ink)
- 심볼: 단순한 ☀ + ✓ 결합 또는 한국 캘리그래피 "하루"
- iOS adaptive: 86px 안전 영역 (둥근 모서리 자동 마스크)
- Android adaptive: 108×108 foreground + background 분리

v1 임시 아이콘은 단색 + "하" 텍스트. 정식 디자인은 외주 또는 디자이너
영입 후 교체.

## 출시 체크리스트

- [ ] 앱 아이콘 (iOS / Android adaptive 모두)
- [ ] 스크린샷 6컷 × 4 사이즈
- [ ] 개인정보처리방침 URL (`https://haru.app/privacy`)
- [ ] 이용약관 URL
- [ ] 지원 이메일 (`support@haru.app`)
- [ ] App Store Connect 계정
- [ ] Google Play Console 계정 ($25 일회성)
- [ ] EAS Build 환경 (Apple Developer Program $99/년 — 정식 출시 시점)
- [ ] 한국 통신판매업 신고 (유료 결제 도입 시)
