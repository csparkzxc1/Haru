/**
 * 개발용 시드. v1 단계에서 인증이 미도입이므로 데모 사용자 한 명을 보장해
 * `x-user-id: 00000000-0000-0000-0000-000000000001` 헤더로 요청이 가능하도록 한다.
 *
 * 실행: pnpm --filter @haru/backend prisma db seed
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

async function main() {
  const now = new Date();
  await prisma.user.upsert({
    where: { id: DEMO_USER_ID },
    update: {},
    create: {
      id: DEMO_USER_ID,
      email: "demo@haru.app",
      nickname: "데모 사용자",
      privacyAgreedAt: now,
      termsAgreedAt: now,
    },
  });

  await prisma.area.upsert({
    where: { id: "11111111-1111-1111-1111-111111111111" },
    update: {},
    create: {
      id: "11111111-1111-1111-1111-111111111111",
      ownerId: DEMO_USER_ID,
      title: "회사",
      colorHex: "#FF6B35",
      icon: "💼",
      sortOrder: 0,
    },
  });

  await prisma.area.upsert({
    where: { id: "22222222-2222-2222-2222-222222222222" },
    update: {},
    create: {
      id: "22222222-2222-2222-2222-222222222222",
      ownerId: DEMO_USER_ID,
      title: "가족",
      colorHex: "#4A90E2",
      icon: "🏠",
      sortOrder: 1,
    },
  });

  console.log(`[seed] demo user ensured: ${DEMO_USER_ID}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
