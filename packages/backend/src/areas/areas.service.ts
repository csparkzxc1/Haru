import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { CreateAreaDto, UpdateAreaDto } from "./areas.dto";

@Injectable()
export class AreasService {
  constructor(private readonly prisma: PrismaService) {}

  list(ownerId: string) {
    return this.prisma.area.findMany({
      where: { ownerId, archivedAt: null },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: { _count: { select: { projects: true, tasks: true } } },
    });
  }

  create(ownerId: string, dto: CreateAreaDto) {
    return this.prisma.area.create({ data: { ...dto, ownerId } });
  }

  async update(ownerId: string, id: string, dto: UpdateAreaDto) {
    const existing = await this.prisma.area.findFirst({ where: { id, ownerId } });
    if (!existing) throw new NotFoundException("Area not found");
    return this.prisma.area.update({ where: { id }, data: dto });
  }

  async archive(ownerId: string, id: string) {
    const existing = await this.prisma.area.findFirst({ where: { id, ownerId } });
    if (!existing) throw new NotFoundException("Area not found");
    return this.prisma.area.update({ where: { id }, data: { archivedAt: new Date() } });
  }
}
