export const metadata = {
  title: "이용약관 — 하루",
};

const UPDATED_AT = "2026-05-02";

export default function TermsPage() {
  return (
    <article>
      <h1 className="text-3xl font-semibold tracking-tight mb-2">이용약관</h1>
      <p className="text-sm text-haru-muted mb-8">최종 개정: {UPDATED_AT}</p>

      <section className="space-y-6 text-[15px] leading-relaxed">
        <div>
          <h2 className="font-semibold mb-2">제1조 (목적)</h2>
          <p>
            본 약관은 하루(이하 "회사")가 제공하는 할 일 관리 서비스(이하
            "서비스")의 이용 조건과 절차, 회사와 회원 간의 권리·의무 및 책임
            사항을 규정함을 목적으로 합니다.
          </p>
        </div>

        <div>
          <h2 className="font-semibold mb-2">제2조 (회원가입)</h2>
          <p>
            회원가입은 이용자가 약관에 동의하고 회사가 정한 양식을 작성하여
            신청하면, 회사가 이를 승낙함으로써 체결됩니다. 만 14세 미만의 자는
            법정대리인의 동의 없이 가입할 수 없습니다.
          </p>
        </div>

        <div>
          <h2 className="font-semibold mb-2">제3조 (서비스 제공)</h2>
          <p>
            회사는 24시간 365일 서비스 제공을 원칙으로 하나, 시스템 점검 등
            불가피한 사유로 일시 중단될 수 있습니다. 회사는 사전에 공지합니다.
          </p>
        </div>

        <div>
          <h2 className="font-semibold mb-2">제4조 (회원의 의무)</h2>
          <p>
            회원은 타인의 정보 도용, 서비스 운영 방해, 불법 정보 게시 등의
            행위를 하여서는 안 되며, 위반 시 회사는 서비스 이용을 제한할 수
            있습니다.
          </p>
        </div>

        <div>
          <h2 className="font-semibold mb-2">제5조 (유료 서비스)</h2>
          <p>
            유료 요금제(Pro / Team)의 결제·환불은 「전자상거래법」 및 회사의
            환불 정책을 따릅니다. 정기 결제는 다음 결제일 24시간 전까지 해지
            가능합니다.
          </p>
        </div>

        <div>
          <h2 className="font-semibold mb-2">제6조 (계약 해지)</h2>
          <p>
            회원은 언제든지 앱 내 "설정 → 계정 → 회원 탈퇴" 메뉴를 통해 계약을
            해지할 수 있으며, 회사는 즉시 회원 정보를 파기합니다. 단, 관계 법령에
            따라 보관 의무가 있는 경우 해당 기간 동안 보관됩니다.
          </p>
        </div>

        <div>
          <h2 className="font-semibold mb-2">제7조 (책임의 한계)</h2>
          <p>
            회사는 천재지변, 전쟁, 회원의 귀책사유 등 회사의 책임 없는 사유로
            발생한 손해에 대하여 책임을 지지 않습니다.
          </p>
        </div>

        <div>
          <h2 className="font-semibold mb-2">제8조 (분쟁 해결)</h2>
          <p>
            본 약관과 관련된 분쟁은 대한민국 법령을 따르며, 관할 법원은 회사
            본점 소재지 관할 법원으로 합니다.
          </p>
        </div>

        <p className="text-haru-muted text-sm pt-6 border-t border-black/5 dark:border-white/10">
          부칙: 본 약관은 {UPDATED_AT}부터 시행됩니다.
        </p>
      </section>
    </article>
  );
}
