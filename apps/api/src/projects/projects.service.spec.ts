import { ProjectRole, UserRole } from "@prisma/client";
import { AuthUser } from "../auth/types/auth-user";
import { PrismaService } from "../prisma/prisma.service";
import { ProjectsService } from "./projects.service";

type PrismaMock = {
  project: { create: jest.Mock };
};

function createPrismaMock(): PrismaMock {
  return {
    project: { create: jest.fn() },
  };
}

describe("ProjectsService", () => {
  it("creates a project owned by the current user and adds them as project manager", async () => {
    const prisma = createPrismaMock();
    const service = new ProjectsService(prisma as unknown as PrismaService);
    const user: AuthUser = {
      id: "33333333-3333-4333-8333-333333333332",
      email: "manager@teamsync.dev",
      role: UserRole.MANAGER,
    };
    const dto = {
      name: "New Project",
      description: "A reviewer-friendly project",
    };
    const createdProject = { id: "project-id", ...dto, ownerId: user.id };
    prisma.project.create.mockResolvedValue(createdProject);

    const result = await service.create(dto, user);

    expect(prisma.project.create).toHaveBeenCalledWith({
      data: {
        name: dto.name,
        description: dto.description,
        ownerId: user.id,
        members: {
          create: { userId: user.id, role: ProjectRole.MANAGER },
        },
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: true,
      },
    });
    expect(result).toBe(createdProject);
  });
});
