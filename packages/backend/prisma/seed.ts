/**
 * 개발용 시드.
 *
 *   이메일: demo@haru.app
 *   비밀번호: demo1234!
 *
 * 백엔드 인증 도입 후, 위 계정으로 로그인하면 데모 데이터(영역 2개, 프로젝트 1개,
 * 더미 Task 3개)에 접근할 수 있다.
 *
 * 실행: pnpm --filter @haru/backend prisma:seed
 */
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";
const DEMO_EMAIL = "demo@haru.app";
const DEMO_PASSWORD = "demo1234!";

async function main() {
  const now = new Date();
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  await prisma.user.upsert({
    where: { id: DEMO_USER_ID },
    update: { passwordHash, email: DEMO_EMAIL },
    create: {
      id: DEMO_USER_ID,
      email: DEMO_EMAIL,
      passwordHash,
      nickname: "데모 사용자",
      privacyAgreedAt: now,
      termsAgreedAt: now,
      socials: {
        create: { provider: "EMAIL", providerId: DEMO_EMAIL },
      },
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

  console.log(`[seed] demo user ensured`);
  console.log(`        email:    ${DEMO_EMAIL}`);
  console.log(`        password: ${DEMO_PASSWORD}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
