import {
  Controller,
  Get,
  Header,
  Headers,
  Param,
  ParseIntPipe,
  Query,
  Res,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import type { Response } from "express";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import {
  getHolidays,
  isHoliday,
} from "@haru/shared/korean-calendar";
import { PrismaService } from "../prisma/prisma.service";
import { buildIcs } from "./ical";

@Controller("calendar")
export class CalendarController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  @Get("holidays/:year")
  holidays(@Param("year", ParseIntPipe) year: number) {
    return getHolidays(year).map((h) => ({
      name: h.name,
      date: h.date.toISOString(),
      substitute: h.substitute,
    }));
  }

  @Get("holiday-check/:iso")
  check(@Param("iso") iso: string) {
    const d = new Date(iso);
    const h = isHoliday(d);
    return { isHoliday: !!h, holiday: h ? { name: h.name, substitute: h.substitute } : null };
  }

  /**
   * 사용자 할 일을 iCal로 내보낸다.
   *
   * 인증: 헤더 Authorization 또는 query token (네이버/구글 캘린더 같은
   * 외부 클라이언트가 헤더 첨부를 못하므로 long-lived 서명된 query token 허용).
   */
  @Get("ics")
  @Header("content-type", "text/calendar; charset=utf-8")
  @Header("content-disposition", "inline; filename=\"haru.ics\"")
  async exportIcs(
    @Headers("authorization") authHeader: string | undefined,
    @Query("token") queryToken: string | undefined,
    @Res() res: Response,
  ) {
    const userId = await this.resolveUserId(authHeader, queryToken);
    const tasks = await this.prisma.task.findMany({
      where: {
        ownerId: userId,
        deletedAt: null,
        OR: [{ when: { not: null } }, { deadline: { not: null } }],
      },
    });

    const ics = buildIcs(
      "하루 (Haru)",
      tasks.map((t) => ({
        uid: t.id,
        summary: t.title,
        description: t.notes ?? undefined,
        start: t.when ?? t.deadline!,
        allDay: t.allDay,
      })),
    );
    res.send(ics);
  }

  /** 외부 캘린더 구독용 long-lived 토큰. */
  @Get("subscribe-token")
  subscribeToken(@Headers("authorization") authHeader: string | undefined) {
    if (!authHeader?.startsWith("Bearer ")) throw new UnauthorizedException();
    const access = authHeader.slice("Bearer ".length);
    const payload = this.jwt.verify<{ sub: string }>(access);
    // 1년 유효 토큰 발급 (audience 분리)
    const token = this.jwt.sign(
      { sub: payload.sub, aud: "calendar" },
      { expiresIn: "365d" },
    );
    const base = this.config.get<string>("PUBLIC_BASE_URL") ?? "http://localhost:3001/api";
    return {
      ics: `${base}/calendar/ics?token=${token}`,
      webcal: `${base.replace(/^http/, "webcal")}/calendar/ics?token=${token}`,
    };
  }

  /**
   * 외부 캘린더 OAuth 시작점 — Google / Naver.
   * 실제 구현은 Phase 2 후반. 키 미설정 시 503.
   */
  @Get("oauth/:provider")
  oauthStart(@Param("provider") provider: string) {
    if (provider === "google") {
      const id = this.config.get<string>("GOOGLE_CLIENT_ID");
      if (!id) {
        throw new ServiceUnavailableException(
          "Google 캘린더 연동은 GOOGLE_CLIENT_ID 환경변수 설정 후 사용 가능합니다",
        );
      }
      // TODO: googleapis 라이브러리로 OAuth 흐름 처리
      return { todo: "google oauth flow", clientId: id };
    }
    if (provider === "naver") {
      const id = this.config.get<string>("NAVER_CLIENT_ID");
      if (!id) {
        throw new ServiceUnavailableException(
          "네이버 캘린더 연동은 NAVER_CLIENT_ID 환경변수 설정 후 사용 가능합니다",
        );
      }
      return { todo: "naver oauth flow", clientId: id };
    }
    throw new ServiceUnavailableException(`지원하지 않는 provider: ${provider}`);
  }

  private async resolveUserId(
    authHeader: string | undefined,
    queryToken: string | undefined,
  ): Promise<string> {
    const token =
      queryToken ?? (authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null);
    if (!token) throw new UnauthorizedException();
    try {
      const payload = this.jwt.verify<{ sub: string; aud?: string }>(token);
      return payload.sub;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
