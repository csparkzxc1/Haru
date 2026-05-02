import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { randomBytes, createHash } from "node:crypto";
import { PrismaService } from "../prisma/prisma.service";
import type { User, SocialProvider } from "@prisma/client";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface SafeUser {
  id: string;
  email: string | null;
  nickname: string;
  timezone: string;
  locale: string;
  avatarUrl: string | null;
  plan: string;
}

const REFRESH_TTL_DAYS = 30;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(input: {
    email: string;
    password: string;
    nickname: string;
    privacyAgreed: boolean;
    termsAgreed: boolean;
    marketingOptIn?: boolean;
  }): Promise<{ user: SafeUser; tokens: AuthTokens }> {
    if (!input.privacyAgreed || !input.termsAgreed) {
      throw new UnauthorizedException("필수 약관에 동의해야 합니다");
    }
    const existing = await this.prisma.user.findUnique({
      where: { email: input.email },
    });
    if (existing) throw new ConflictException("이미 가입된 이메일입니다");

    const passwordHash = await bcrypt.hash(input.password, 10);
    const now = new Date();
    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        nickname: input.nickname,
        passwordHash,
        privacyAgreedAt: now,
        termsAgreedAt: now,
        marketingOptIn: input.marketingOptIn ?? false,
        marketingOptInAt: input.marketingOptIn ? now : null,
        socials: {
          create: { provider: "EMAIL", providerId: input.email },
        },
      },
    });
    const tokens = await this.issueTokens(user);
    return { user: this.toSafeUser(user), tokens };
  }

  async login(email: string, password: string): Promise<{ user: SafeUser; tokens: AuthTokens }> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) throw new UnauthorizedException("이메일 또는 비밀번호가 올바르지 않습니다");
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException("이메일 또는 비밀번호가 올바르지 않습니다");
    const tokens = await this.issueTokens(user);
    return { user: this.toSafeUser(user), tokens };
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const hash = this.hashRefresh(refreshToken);
    const session = await this.prisma.session.findFirst({
      where: { refreshHash: hash, revokedAt: null, expiresAt: { gt: new Date() } },
      include: { user: true },
    });
    if (!session) throw new UnauthorizedException("세션이 만료되었습니다");
    // 회전: 기존 세션 폐기 후 새 토큰 발급
    await this.prisma.session.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });
    return this.issueTokens(session.user);
  }

  async logout(refreshToken: string) {
    const hash = this.hashRefresh(refreshToken);
    await this.prisma.session.updateMany({
      where: { refreshHash: hash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { ok: true };
  }

  async loginOrCreateSocial(input: {
    provider: SocialProvider;
    providerId: string;
    email?: string;
    nickname: string;
    avatarUrl?: string;
  }): Promise<{ user: SafeUser; tokens: AuthTokens }> {
    const existingSocial = await this.prisma.socialAccount.findUnique({
      where: {
        provider_providerId: {
          provider: input.provider,
          providerId: input.providerId,
        },
      },
      include: { user: true },
    });

    let user: User;
    if (existingSocial) {
      user = existingSocial.user;
    } else {
      const now = new Date();
      user = await this.prisma.user.create({
        data: {
          email: input.email ?? null,
          nickname: input.nickname,
          avatarUrl: input.avatarUrl ?? null,
          // 소셜 로그인은 약관 동의 페이지를 거쳐 들어왔다고 가정
          privacyAgreedAt: now,
          termsAgreedAt: now,
          socials: {
            create: { provider: input.provider, providerId: input.providerId },
          },
        },
      });
    }
    const tokens = await this.issueTokens(user);
    return { user: this.toSafeUser(user), tokens };
  }

  async getMe(userId: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    return this.toSafeUser(user);
  }

  private toSafeUser(u: User): SafeUser {
    return {
      id: u.id,
      email: u.email,
      nickname: u.nickname,
      timezone: u.timezone,
      locale: u.locale,
      avatarUrl: u.avatarUrl,
      plan: u.plan,
    };
  }

  private async issueTokens(user: User): Promise<AuthTokens> {
    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
    });
    const refreshToken = randomBytes(48).toString("base64url");
    const expiresAt = new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);
    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshHash: this.hashRefresh(refreshToken),
        expiresAt,
      },
    });
    return { accessToken, refreshToken };
  }

  private hashRefresh(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }
}
