import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { CreateFamilyEventDto, UpdateFamilyEventDto } from "./family-events.dto";

@Injectable()
export class FamilyEventsService {
  constructor(private readonly prisma: PrismaService) {}

  list(ownerId: string, year?: number) {
    const where: { ownerId: string; date?: { gte: Date; lt: Date } } = { ownerId };
    if (year) {
      where.date = {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1),
      };
    }
    return this.prisma.familyEvent.findMany({
      where,
      orderBy: { date: "asc" },
    });
  }

  /** 연간 통계: 보낸 / 받은 / 순지출 */
  async stats(ownerId: string, year: number) {
    const events = await this.prisma.familyEvent.findMany({
      where: {
        ownerId,
        date: {
          gte: new Date(year, 0, 1),
          lt: new Date(year + 1, 0, 1),
        },
      },
      select: { amountKrw: true, receivedKrw: true, kind: true },
    });
    const sent = events.reduce((s, e) => s + (e.amountKrw ?? 0), 0);
    const received = events.reduce((s, e) => s + (e.receivedKrw ?? 0), 0);
    const byKind: Record<string, number> = {};
    for (const e of events) {
      byKind[e.kind] = (byKind[e.kind] ?? 0) + (e.amountKrw ?? 0);
    }
    return { year, sent, received, net: sent - received, byKind, count: events.length };
  }

  create(ownerId: string, dto: CreateFamilyEventDto) {
    return this.prisma.familyEvent.create({
      data: { ...dto, date: new Date(dto.date), ownerId },
    });
  }

  async update(ownerId: string, id: string, dto: UpdateFamilyEventDto) {
    const existing = await this.prisma.familyEvent.findFirst({
      where: { id, ownerId },
    });
    if (!existing) throw new NotFoundException();
    return this.prisma.familyEvent.update({
      where: { id },
      data: {
        ...dto,
        date: dto.date ? new Date(dto.date) : undefined,
      },
    });
  }

  async remove(ownerId: string, id: string) {
    const existing = await this.prisma.familyEvent.findFirst({
      where: { id, ownerId },
    });
    if (!existing) throw new NotFoundException();
    await this.prisma.familyEvent.delete({ where: { id } });
    return { ok: true };
  }
}
