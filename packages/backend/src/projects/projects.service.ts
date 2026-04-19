import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export interface CreateProjectInput {
  title: string;
  notes?: string;
  areaId?: string;
  deadline?: string;
}

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  list(ownerId: string, areaId?: string) {
    return this.prisma.project.findMany({
      where: { ownerId, ...(areaId ? { areaId } : {}) },
      include: { _count: { select: { tasks: true } } },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
  }

  async get(ownerId: string, id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, ownerId },
      include: { tasks: { where: { status: "OPEN" }, orderBy: { sortOrder: "asc" } } },
    });
    if (!project) throw new NotFoundException();
    return project;
  }

  create(ownerId: string, input: CreateProjectInput) {
    return this.prisma.project.create({
      data: {
        ownerId,
        title: input.title,
        notes: input.notes,
        areaId: input.areaId,
        deadline: input.deadline ? new Date(input.deadline) : null,
      },
    });
  }

  async complete(ownerId: string, id: string) {
    await this.get(ownerId, id);
    return this.prisma.project.update({
      where: { id },
      data: { status: "COMPLETED", completedAt: new Date() },
    });
  }
}
