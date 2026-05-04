import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { createHash, randomBytes } from "node:crypto";
import { PrismaService } from "../prisma/prisma.service";

const VALID_SCOPES = [
  "tasks:read",
  "tasks:write",
  "quick-entry:write",
  "areas:read",
  "calendar:read",
] as const;
export type Scope = (typeof VALID_SCOPES)[number];

export interface CreatedApiKey {
  id: string;
  label: string;
  /** 평문. 이번 응답 한 번만 노출됨. */
  key: string;
  prefix: string;
  scopes: Scope[];
  createdAt: Date;
}

@Injectable()
export class ApiKeysService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.apiKey.findMany({
      where: { userId, revokedAt: null },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        label: true,
        keyPrefix: true,
        scopes: true,
        lastUsedAt: true,
        createdAt: true,
      },
    });
  }

  async create(userId: string, label: string, scopes: Scope[]): Promise<CreatedApiKey> {
    for (const s of scopes) {
      if (!VALID_SCOPES.includes(s)) {
        throw new ForbiddenException(`알 수 없는 스코프: ${s}`);
      }
    }
    // 평문: "haru_ak_" + 32 bytes base64url
    const raw = `haru_ak_${randomBytes(32).toString("base64url")}`;
    const keyHash = createHash("sha256").update(raw).digest("hex");
    const keyPrefix = raw.slice(0, 16); // "haru_ak_<8글자>"

    const created = await this.prisma.apiKey.create({
      data: {
        userId,
        label,
        keyHash,
        keyPrefix,
        scopes: scopes.join(","),
      },
    });

    return {
      id: created.id,
      label,
      key: raw,
      prefix: keyPrefix,
      scopes,
      createdAt: created.createdAt,
    };
  }

  async revoke(userId: string, id: string) {
    const key = await this.prisma.apiKey.findFirst({
      where: { id, userId },
    });
    if (!key) throw new NotFoundException();
    await this.prisma.apiKey.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
    return { ok: true };
  }

  /** 외부 호출 시 인증 — controller 가 직접 호출. */
  async resolve(rawKey: string): Promise<{
    userId: string;
    scopes: string[];
  } | null> {
    if (!rawKey.startsWith("haru_ak_")) return null;
    const keyHash = createHash("sha256").update(rawKey).digest("hex");
    const row = await this.prisma.apiKey.findFirst({
      where: { keyHash, revokedAt: null },
    });
    if (!row) return null;
    // last-used 갱신 (best-effort)
    void this.prisma.apiKey.update({
      where: { id: row.id },
      data: { lastUsedAt: new Date() },
    });
    return { userId: row.userId, scopes: row.scopes.split(",") };
  }
}
