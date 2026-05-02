import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Length,
  Matches,
} from "class-validator";
import { WorkspacesService } from "./workspaces.service";
import { CurrentUser, JwtAuthGuard } from "../auth/jwt-auth.guard";
import type { AuthenticatedUser } from "../auth/jwt.strategy";

class CreateWorkspaceDto {
  @IsString() @Length(1, 80) name!: string;
  @IsOptional() @Matches(/^\d{10}$/, { message: "사업자번호는 하이픈 없는 10자리 숫자" })
  bizRegNo?: string;
  @IsOptional() @IsIn(["team", "business"]) plan?: "team" | "business";
}

class AddMemberDto {
  @IsEmail() email!: string;
  @IsOptional() @IsIn(["admin", "member"]) role?: "admin" | "member";
}

@Controller("workspaces")
@UseGuards(JwtAuthGuard)
export class WorkspacesController {
  constructor(private readonly service: WorkspacesService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.service.listMine(user.id);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateWorkspaceDto,
  ) {
    return this.service.create(user.id, dto);
  }

  @Get(":id/members")
  members(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.service.listMembers(user.id, id);
  }

  @Post(":id/members")
  addMember(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: AddMemberDto,
  ) {
    return this.service.addMember(user.id, id, dto.email, dto.role ?? "member");
  }

  @Delete(":id/members/:memberId")
  removeMember(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Param("memberId") memberId: string,
  ) {
    return this.service.removeMember(user.id, id, memberId);
  }

  @Get(":id/invoices")
  invoices(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.service.listInvoices(user.id, id);
  }
}
