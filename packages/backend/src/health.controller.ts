import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";

@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Render/UptimeRobot 등 외부 핑이 호출하는 라이트 헬스체크.
   * DB 호출 없이 항상 200 OK — 호스팅 사이드의 sleep 방지가 목적.
   * Neon DB가 idle 상태여도 핑이 통과해야 한다.
   */
  @Get()
  liveness() {
    return { status: "ok", time: new Date().toISOString() };
  }

  /**
   * 내부 모니터링용. DB 라운드트립을 포함하므로 외부 cron 으로
   * 주기적으로 호출하면 Neon 도 깨어 있게 유지된다.
   */
  @Get("ready")
  async readiness() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: "ok", db: "up", time: new Date().toISOString() };
    } catch (err) {
      return {
        status: "degraded",
        db: "down",
        error: (err as Error).message,
        time: new Date().toISOString(),
      };
    }
  }
}
