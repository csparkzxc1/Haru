import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { FamilyEventsService } from "./family-events.service";
import {
  CreateFamilyEventDto,
  UpdateFamilyEventDto,
} from "./family-events.dto";
import { CurrentUser, JwtAuthGuard } from "../auth/jwt-auth.guard";
import type { AuthenticatedUser } from "../auth/jwt.strategy";

@Controller("family-events")
@UseGuards(JwtAuthGuard)
export class FamilyEventsController {
  constructor(private readonly events: FamilyEventsService) {}

  @Get()
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query("year") year?: string,
  ) {
    return this.events.list(user.id, year ? parseInt(year, 10) : undefined);
  }

  @Get("stats/:year")
  stats(
    @CurrentUser() user: AuthenticatedUser,
    @Param("year", ParseIntPipe) year: number,
  ) {
    return this.events.stats(user.id, year);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateFamilyEventDto,
  ) {
    return this.events.create(user.id, dto);
  }

  @Patch(":id")
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: UpdateFamilyEventDto,
  ) {
    return this.events.update(user.id, id, dto);
  }

  @Delete(":id")
  remove(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.events.remove(user.id, id);
  }
}
