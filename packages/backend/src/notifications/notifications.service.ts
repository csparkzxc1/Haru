import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ExpoPushService } from "./expo-push.service";

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly expo: ExpoPushService,
  ) {}

  async registerDevice(
    userId: string,
    token: string,
    platform: "expo" | "fcm" | "apns" = "expo",
    deviceLabel?: string,
  ) {
    return this.prisma.pushToken.upsert({
      where: { token },
      update: { userId, platform, deviceLabel, lastUsedAt: new Date() },
      create: { userId, token, platform, deviceLabel },
    });
  }

  async unregisterDevice(userId: string, token: string) {
    await this.prisma.pushToken.deleteMany({ where: { userId, token } });
    return { ok: true };
  }

  async sendToUser(
    userId: string,
    message: { title?: string; body?: string; data?: Record<string, unknown> },
  ) {
    const tokens = await this.prisma.pushToken.findMany({ where: { userId } });
    if (tokens.length === 0) return;
    await this.expo.send(
      tokens.map((t) => ({
        to: t.token,
        title: message.title,
        body: message.body,
        data: message.data,
        sound: "default",
      })),
    );
  }
}
