import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { parseKoreanEntry } from "@haru/shared/korean-date";
import { TasksService } from "../tasks/tasks.service";
import { IsOptional, IsString } from "class-validator";
import { CurrentUser, JwtAuthGuard } from "../auth/jwt-auth.guard";
import type { AuthenticatedUser } from "../auth/jwt.strategy";

class QuickEntryDto {
  @IsString() raw!: string;
  @IsOptional() @IsString() projectId?: string;
  @IsOptional() @IsString() areaId?: string;
}

/**
 * Quick Entry: 자연어 한 줄 입력으로 Task 생성.
 * 예) "내일 오후 3시 팀 회의 #회의"
 */
@Controller("quick-entry")
export class QuickEntryController {
  constructor(private readonly tasks: TasksService) {}

  @Post("preview")
  preview(@Body() dto: QuickEntryDto) {
    return parseKoreanEntry(dto.raw);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: QuickEntryDto) {
    const parsed = parseKoreanEntry(dto.raw);
    return this.tasks.create(user.id, {
      title: parsed.title,
      when: parsed.when ?? undefined,
      deadline: parsed.deadline ?? undefined,
      allDay: parsed.allDay,
      tags: parsed.tags,
      projectId: dto.projectId,
      areaId: dto.areaId,
    });
  }
}
