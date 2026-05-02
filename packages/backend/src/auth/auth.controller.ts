import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  ServiceUnavailableException,
  UseGuards,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthGuard } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "./auth.service";
import { LoginDto, RefreshDto, RegisterDto } from "./auth.dto";
import { CurrentUser, JwtAuthGuard } from "./jwt-auth.guard";
import { KakaoStrategy, type KakaoSocialPayload } from "./kakao.strategy";
import type { AuthenticatedUser } from "./jwt.strategy";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post("register")
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post("login")
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @Post("refresh")
  @HttpCode(200)
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  @Post("logout")
  @HttpCode(200)
  logout(@Body() dto: RefreshDto) {
    return this.auth.logout(dto.refreshToken);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.auth.getMe(user.id);
  }

  @Get("kakao")
  @UseGuards(AuthGuard("kakao"))
  kakaoLogin() {
    if (!KakaoStrategy.enabled) {
      throw new ServiceUnavailableException(
        "카카오 로그인은 KAKAO_CLIENT_ID 환경변수가 설정되어야 동작합니다",
      );
    }
    // Passport가 인가 페이지로 리디렉트
  }

  @Get("kakao/callback")
  @UseGuards(AuthGuard("kakao"))
  async kakaoCallback(@Req() req: Request, @Res() res: Response) {
    const profile = req.user as KakaoSocialPayload;
    const result = await this.auth.loginOrCreateSocial({
      provider: "KAKAO",
      providerId: profile.providerId,
      email: profile.email,
      nickname: profile.nickname,
      avatarUrl: profile.avatarUrl,
    });
    const redirect =
      this.config.get<string>("WEB_AUTH_REDIRECT") ??
      "http://localhost:3000/auth/callback";
    const params = new URLSearchParams({
      access: result.tokens.accessToken,
      refresh: result.tokens.refreshToken,
    });
    res.redirect(`${redirect}#${params.toString()}`);
  }
}
