import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { Logger, ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

const REQUIRED_ENV = ["DATABASE_URL", "JWT_SECRET"] as const;
const RECOMMENDED_ENV = ["CORS_ORIGIN", "PUBLIC_BASE_URL"] as const;

function assertEnv(): void {
  const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    // 콘솔에 즉시 경고 후 종료. 배포 직후 잘못된 시크릿 설정을 빠르게 잡는다.
    // eslint-disable-next-line no-console
    console.error(
      `[haru-backend] 필수 환경변수가 누락되었습니다: ${missing.join(", ")}\n` +
        `   .env.example 을 참고해 .env 또는 호스팅 대시보드에 설정해 주세요.`,
    );
    process.exit(1);
  }

  if (
    process.env.NODE_ENV === "production" &&
    (process.env.JWT_SECRET ?? "").length < 32
  ) {
    // eslint-disable-next-line no-console
    console.error(
      "[haru-backend] JWT_SECRET 이 너무 짧습니다. openssl rand -base64 48 결과를 사용하세요.",
    );
    process.exit(1);
  }

  const log = new Logger("env");
  for (const k of RECOMMENDED_ENV) {
    if (!process.env[k]) {
      log.warn(`권장 환경변수 ${k} 가 비어 있습니다.`);
    }
  }
}

async function bootstrap() {
  assertEnv();

  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.setGlobalPrefix("api");
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );
  app.enableCors({
    origin: (process.env.CORS_ORIGIN ?? "").split(",").filter(Boolean),
    credentials: true,
  });
  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port, "0.0.0.0");
  // eslint-disable-next-line no-console
  console.log(`[haru-backend] listening on :${port}`);
}

bootstrap();
