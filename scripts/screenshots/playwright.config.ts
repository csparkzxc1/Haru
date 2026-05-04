import { defineConfig, devices } from "@playwright/test";

/**
 * 앱스토어/구글플레이/원스토어 제출용 스크린샷 자동 캡처.
 *
 * 같은 시드 사용자(`demo@haru.app`) + 같은 브라우저 viewport 로 매번 동일한
 * 결과물을 만든다. 디자인 변경 시 워크플로 한 번 재실행으로 모든 스토어
 * 메타데이터 갱신 가능.
 *
 * BASE_URL 환경변수로 스크린샷 대상 배포 지정.
 *   기본: http://localhost:3000  (로컬 dev)
 *   prod: https://haru.vercel.app
 */
export default defineConfig({
  testDir: "./tests",
  outputDir: "./output",
  reporter: [["list"]],
  fullyParallel: false, // 같은 데모 계정 공유 → 직렬
  workers: 1,
  retries: 0,
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    locale: "ko-KR",
    timezoneId: "Asia/Seoul",
    colorScheme: "light",
    deviceScaleFactor: 3, // 레티나 결과물
    screenshot: "only-on-failure",
    video: "off",
    trace: "off",
  },
  projects: [
    {
      name: "iphone-6.7",
      use: {
        ...devices["iPhone 14 Pro Max"],
        viewport: { width: 430, height: 932 },
      },
    },
    {
      name: "iphone-6.5",
      use: {
        ...devices["iPhone 11 Pro Max"],
        viewport: { width: 414, height: 896 },
      },
    },
    {
      name: "android",
      use: {
        viewport: { width: 1080 / 3, height: 2400 / 3 },
        deviceScaleFactor: 3,
      },
    },
    {
      name: "desktop",
      use: {
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 2,
      },
    },
    {
      name: "ipad",
      use: {
        ...devices["iPad Pro 11"],
        viewport: { width: 834, height: 1194 },
      },
    },
  ],
});
