import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { ProjectsService, type CreateProjectInput } from "./projects.service";
import { CurrentUser, JwtAuthGuard } from "../auth/jwt-auth.guard";
import type { AuthenticatedUser } from "../auth/jwt.strategy";

@Controller("projects")
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser, @Query("areaId") areaId?: string) {
    return this.projects.list(user.id, areaId);
  }

  @Get(":id")
  get(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.projects.get(user.id, id);
  }

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() body: CreateProjectInput) {
    return this.projects.create(user.id, body);
  }

  @Post(":id/complete")
  complete(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.projects.complete(user.id, id);
  }
}
