import { Body, Controller, Get, Headers, Param, Post, Query } from "@nestjs/common";
import { ProjectsService, type CreateProjectInput } from "./projects.service";

@Controller("projects")
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  list(@Headers("x-user-id") userId: string, @Query("areaId") areaId?: string) {
    return this.projects.list(userId, areaId);
  }

  @Get(":id")
  get(@Headers("x-user-id") userId: string, @Param("id") id: string) {
    return this.projects.get(userId, id);
  }

  @Post()
  create(@Headers("x-user-id") userId: string, @Body() body: CreateProjectInput) {
    return this.projects.create(userId, body);
  }

  @Post(":id/complete")
  complete(@Headers("x-user-id") userId: string, @Param("id") id: string) {
    return this.projects.complete(userId, id);
  }
}
