import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Headers } from "@nestjs/common";
import { TasksService } from "./tasks.service";
import { CreateTaskDto, ListTasksQuery, UpdateTaskDto } from "./tasks.dto";

/**
 * v1 단계: 인증 미들웨어 미도입. 헤더 `x-user-id`로 사용자 식별.
 * Phase 1 후반부 Passport JWT + Kakao OAuth 장착 시 Guard로 교체.
 */
@Controller("tasks")
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get()
  list(@Headers("x-user-id") userId: string, @Query() query: ListTasksQuery) {
    return this.tasks.list(userId, query);
  }

  @Get(":id")
  get(@Headers("x-user-id") userId: string, @Param("id") id: string) {
    return this.tasks.get(userId, id);
  }

  @Post()
  create(@Headers("x-user-id") userId: string, @Body() dto: CreateTaskDto) {
    return this.tasks.create(userId, dto);
  }

  @Patch(":id")
  update(@Headers("x-user-id") userId: string, @Param("id") id: string, @Body() dto: UpdateTaskDto) {
    return this.tasks.update(userId, id, dto);
  }

  @Post(":id/complete")
  complete(@Headers("x-user-id") userId: string, @Param("id") id: string) {
    return this.tasks.complete(userId, id);
  }

  @Delete(":id")
  remove(@Headers("x-user-id") userId: string, @Param("id") id: string) {
    return this.tasks.remove(userId, id);
  }
}
