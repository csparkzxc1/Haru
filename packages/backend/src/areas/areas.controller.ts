import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { AreasService } from "./areas.service";
import { CreateAreaDto, UpdateAreaDto } from "./areas.dto";
import { CurrentUser, JwtAuthGuard } from "../auth/jwt-auth.guard";
import type { AuthenticatedUser } from "../auth/jwt.strategy";

@Controller("areas")
@UseGuards(JwtAuthGuard)
export class AreasController {
  constructor(private readonly areas: AreasService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.areas.list(user.id);
  }

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateAreaDto) {
    return this.areas.create(user.id, dto);
  }

  @Patch(":id")
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: UpdateAreaDto,
  ) {
    return this.areas.update(user.id, id, dto);
  }

  @Post(":id/archive")
  archive(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.areas.archive(user.id, id);
  }
}
