import {
  Controller,
  Delete,
  Get,
  Header,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Response } from "express";
import { DataPortabilityService } from "./data-portability.service";
import { CurrentUser, JwtAuthGuard } from "../auth/jwt-auth.guard";
import type { AuthenticatedUser } from "../auth/jwt.strategy";

@Controller("data")
@UseGuards(JwtAuthGuard)
export class DataPortabilityController {
  constructor(private readonly service: DataPortabilityService) {}

  /** GDPR-style 데이터 다운로드. JSON 파일 첨부로 반환. */
  @Get("export")
  @Header("content-type", "application/json; charset=utf-8")
  @Header(
    "content-disposition",
    "attachment; filename=\"haru-data-export.json\"",
  )
  async export(
    @CurrentUser() user: AuthenticatedUser,
    @Res() res: Response,
  ) {
    const data = await this.service.exportAll(user.id);
    res.send(JSON.stringify(data, null, 2));
  }

  /** 탈퇴 — 소프트 삭제, 7일 후 영구 파기 예정. */
  @Delete("account")
  deleteAccount(@CurrentUser() user: AuthenticatedUser) {
    return this.service.deleteAccount(user.id);
  }
}
