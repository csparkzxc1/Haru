export const metadata = {
  title: "개인정보처리방침 — 하루",
};

const UPDATED_AT = "2026-05-02";

export default function PrivacyPage() {
  return (
    <article className="prose-haru">
      <h1 className="text-3xl font-semibold tracking-tight mb-2">개인정보처리방침</h1>
      <p className="text-sm text-haru-muted mb-8">최종 개정: {UPDATED_AT}</p>

      <section className="space-y-6 text-[15px] leading-relaxed">
        <div>
          <h2 className="font-semibold mb-2">1. 처리 목적</h2>
          <p>
            하루(Haru, 이하 "서비스")는 회원 식별·인증, 할 일 데이터의 클라우드
            동기화, 푸시 알림 발송, 고객 문의 응대를 위해 개인정보를 처리합니다.
            처리한 개인정보는 명시한 목적 외 용도로 이용하지 않습니다.
          </p>
        </div>

        <div>
          <h2 className="font-semibold mb-2">2. 처리 항목</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>회원가입: 이메일, 닉네임, 비밀번호 해시</li>
            <li>소셜 로그인: 카카오/네이버/애플/구글 식별자, 닉네임, 프로필 이미지(선택)</li>
            <li>이용 기록: 접속 로그, 기기 정보, IP 주소</li>
            <li>서비스 이용: 사용자가 직접 입력한 할 일·메모·태그·체크리스트</li>
          </ul>
        </div>

        <div>
          <h2 className="font-semibold mb-2">3. 보유 및 이용 기간</h2>
          <p>
            회원 탈퇴 즉시 모든 개인정보를 파기하되, 「전자상거래 등에서의
            소비자 보호에 관한 법률」 등 관계 법령에 따라 5년까지 보관할 수
            있습니다. 백업 데이터는 30일 이내 추가 삭제됩니다.
          </p>
        </div>

        <div>
          <h2 className="font-semibold mb-2">4. 제3자 제공</h2>
          <p>
            법령에 근거한 경우를 제외하고 개인정보를 제3자에게 제공하지 않습니다.
            처리 위탁 현황은 본 방침의 부록에 공개합니다.
          </p>
        </div>

        <div>
          <h2 className="font-semibold mb-2">5. 이용자 권리</h2>
          <p>
            이용자는 언제든지 개인정보 열람, 정정, 삭제, 처리정지를 요청할 수
            있으며, 앱 내 "설정 → 계정 → 데이터 내보내기/삭제" 메뉴에서 즉시
            실행할 수 있습니다.
          </p>
        </div>

        <div>
          <h2 className="font-semibold mb-2">6. 안전성 확보 조치</h2>
          <p>
            개인정보는 전송 구간 TLS 1.3 암호화 및 저장 시 AES-256 암호화로
            보호됩니다. 접근 권한 최소화, 분기별 보안 점검, 침입 탐지를
            운영합니다.
          </p>
        </div>

        <div>
          <h2 className="font-semibold mb-2">7. 개인정보 보호책임자</h2>
          <p>
            개인정보 보호책임자: 하루 개발팀 / 문의: privacy@haru.app
          </p>
        </div>

        <p className="text-haru-muted text-sm pt-6 border-t border-black/5 dark:border-white/10">
          본 방침은 개인정보 보호법 제30조에 따른 의무 공개 사항이며, 변경 시
          최소 7일 전 공지합니다.
        </p>
      </section>
    </article>
  );
}
