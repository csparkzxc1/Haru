import { test, expect } from "@playwright/test";
import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * 앱스토어 스크린샷 6컷.
 *
 * 시드 데이터(`pnpm --filter @haru/backend prisma:seed`) 가 적용된 환경에서
 * `demo@haru.app` / `demo1234!` 로 로그인 후 캡처.
 *
 * 사용:
 *   BASE_URL=http://localhost:3000 \
 *     pnpm --filter '@haru/screenshots' test
 *
 * 산출물:
 *   scripts/screenshots/output/<project>/<screen>.png
 */

const SCREENS = [
  { name: "01-today", path: "/today" },
  { name: "02-this-week", path: "/this-week" },
  { name: "03-family-events", path: "/family-events" },
  { name: "04-areas", path: "/areas" },
  { name: "05-settings", path: "/settings" },
  { name: "06-ai-organize", path: "/today" }, // AI 결과는 today 페이지에 떠있다고 가정
] as const;

test.describe("앱스토어 스크린샷", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    // 로그인 — UI 거치지 않고 토큰 직접 주입 (안정성 + 속도)
    await page.goto(`${baseURL}/login`);
    await page.fill('input[type="email"]', "demo@haru.app");
    await page.fill('input[type="password"]', "demo1234!");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/today$/);
  });

  for (const screen of SCREENS) {
    test(screen.name, async ({ page }, testInfo) => {
      await page.goto(screen.path);
      // 콘텐츠 안정화 대기 (네트워크 idle)
      await page.waitForLoadState("networkidle");
      // 시각 안정화 (애니메이션, 폰트)
      await page.waitForTimeout(500);

      const outDir = path.join(
        path.dirname(__dirname),
        "output",
        testInfo.project.name,
      );
      await fs.mkdir(outDir, { recursive: true });
      const outPath = path.join(outDir, `${screen.name}.png`);

      await page.screenshot({ path: outPath, fullPage: false });
      // 회귀 비교용 baseline (변경 시 review-required)
      await expect(page).toHaveScreenshot(`${screen.name}.png`, {
        maxDiffPixelRatio: 0.05, // 5% 까지 허용 (폰트 hinting 차이 등)
      });
    });
  }
});
