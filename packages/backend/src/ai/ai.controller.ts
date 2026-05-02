import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { IsString, MinLength } from "class-validator";
import { AiService } from "./ai.service";
import { AnthropicService } from "./anthropic.service";
import { CurrentUser, JwtAuthGuard } from "../auth/jwt-auth.guard";
import type { AuthenticatedUser } from "../auth/jwt.strategy";

class DecomposeDto {
  @IsString() @MinLength(2) goal!: string;
}

@Controller("ai")
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(
    private readonly ai: AiService,
    private readonly anthropic: AnthropicService,
  ) {}

  @Get("status")
  status() {
    return { enabled: this.anthropic.enabled };
  }

  @Post("today/organize")
  organize(@CurrentUser() user: AuthenticatedUser) {
    return this.ai.organizeToday(user.id);
  }

  @Post("weekly-review")
  review(@CurrentUser() user: AuthenticatedUser) {
    return this.ai.generateWeeklyReview(user.id);
  }

  @Post("decompose")
  decompose(@CurrentUser() user: AuthenticatedUser, @Body() dto: DecomposeDto) {
    return this.ai.decomposeProject(user.id, dto.goal.trim());
  }
}
