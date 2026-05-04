import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { SyncService } from "./sync.service";
import { PushDto } from "./sync.dto";
import { CurrentUser, JwtAuthGuard } from "../auth/jwt-auth.guard";
import type { AuthenticatedUser } from "../auth/jwt.strategy";

@Controller("sync")
@UseGuards(JwtAuthGuard)
export class SyncController {
  constructor(private readonly sync: SyncService) {}

  /** 변경 피드. since 가 없으면 전체 스냅샷. */
  @Get("pull")
  pull(
    @CurrentUser() user: AuthenticatedUser,
    @Query("since") since?: string,
  ) {
    const sinceDate = since ? new Date(since) : null;
    if (sinceDate && Number.isNaN(sinceDate.getTime())) {
      return this.sync.pull(user.id, null);
    }
    return this.sync.pull(user.id, sinceDate);
  }

  /** 오프라인 동안 누적된 변형 일괄 적용. */
  @Post("push")
  push(@CurrentUser() user: AuthenticatedUser, @Body() body: PushDto) {
    return this.sync.push(user.id, body.ops);
  }
}
