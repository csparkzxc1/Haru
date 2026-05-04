import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
// passport-kakao 타입 미제공 — 임포트는 require 형태로 처리.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const KakaoStrategyImpl = require("passport-kakao").Strategy;
import { ConfigService } from "@nestjs/config";

export interface KakaoProfile {
  provider: "kakao";
  id: string;
  username?: string;
  displayName?: string;
  _json?: {
    kakao_account?: {
      email?: string;
      profile?: { nickname?: string; profile_image_url?: string };
    };
  };
}

export interface KakaoSocialPayload {
  providerId: string;
  email?: string;
  nickname: string;
  avatarUrl?: string;
}

/**
 * 카카오 OAuth 2.0. 실제 운영 시 https://developers.kakao.com 에서 발급한
 * REST API 키 + Redirect URI를 .env 에 설정한다.
 *
 *   KAKAO_CLIENT_ID=xxxxxxxx
 *   KAKAO_CLIENT_SECRET=optional
 *   KAKAO_CALLBACK_URL=http://localhost:3001/api/auth/kakao/callback
 *
 * v1 단계에서는 키 미설정 시 가짜 값으로 등록되며 실제 흐름은 동작하지 않는다.
 * 라우트 자체가 호출되었을 때 401을 반환하도록 컨트롤러에서 가드한다.
 */
@Injectable()
export class KakaoStrategy extends PassportStrategy(KakaoStrategyImpl, "kakao") {
  static readonly enabled = !!process.env.KAKAO_CLIENT_ID;

  constructor(config: ConfigService) {
    super({
      clientID: config.get<string>("KAKAO_CLIENT_ID") ?? "missing",
      clientSecret: config.get<string>("KAKAO_CLIENT_SECRET") ?? "",
      callbackURL:
        config.get<string>("KAKAO_CALLBACK_URL") ??
        "http://localhost:3001/api/auth/kakao/callback",
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: KakaoProfile,
  ): KakaoSocialPayload {
    const account = profile._json?.kakao_account;
    return {
      providerId: profile.id,
      email: account?.email,
      nickname:
        account?.profile?.nickname ??
        profile.displayName ??
        profile.username ??
        "카카오 사용자",
      avatarUrl: account?.profile?.profile_image_url,
    };
  }
}
