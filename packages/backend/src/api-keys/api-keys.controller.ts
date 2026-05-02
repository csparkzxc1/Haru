import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { IsArray, IsIn, IsString, Length } from "class-validator";
import { ApiKeysService, type Scope } from "./api-keys.service";
import { CurrentUser, JwtAuthGuard } from "../auth/jwt-auth.guard";
import type { AuthenticatedUser } from "../auth/jwt.strategy";

const SCOPE_VALUES: Scope[] = [
  "tasks:read",
  "tasks:write",
  "quick-entry:write",
  "areas:read",
  "calendar:read",
];

class CreateApiKeyDto {
  @IsString() @Length(1, 80) label!: string;
  @IsArray()
  @IsIn(SCOPE_VALUES, { each: true })
  scopes!: Scope[];
}

@Controller("api-keys")
@UseGuards(JwtAuthGuard)
export class ApiKeysController {
  constructor(private readonly service: ApiKeysService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.service.list(user.id);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateApiKeyDto,
  ) {
    return this.service.create(user.id, dto.label, dto.scopes);
  }

  @Delete(":id")
  revoke(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.service.revoke(user.id, id);
  }
}
