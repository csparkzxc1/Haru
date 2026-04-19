import { Body, Controller, Get, Headers, Param, Patch, Post } from "@nestjs/common";
import { AreasService } from "./areas.service";
import { CreateAreaDto, UpdateAreaDto } from "./areas.dto";

@Controller("areas")
export class AreasController {
  constructor(private readonly areas: AreasService) {}

  @Get()
  list(@Headers("x-user-id") userId: string) {
    return this.areas.list(userId);
  }

  @Post()
  create(@Headers("x-user-id") userId: string, @Body() dto: CreateAreaDto) {
    return this.areas.create(userId, dto);
  }

  @Patch(":id")
  update(@Headers("x-user-id") userId: string, @Param("id") id: string, @Body() dto: UpdateAreaDto) {
    return this.areas.update(userId, id, dto);
  }

  @Post(":id/archive")
  archive(@Headers("x-user-id") userId: string, @Param("id") id: string) {
    return this.areas.archive(userId, id);
  }
}
