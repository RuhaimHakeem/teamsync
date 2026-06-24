import { ForbiddenException } from "@nestjs/common";
import {
  ProjectRole,
  TaskPriority,
  TaskStatus,
  UserRole,
} from "@prisma/client";
import { AuthUser } from "../auth/types/auth-user";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTaskDto } from "./dto/create-task.dto";
import { TaskQueryDto } from "./dto/task-query.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { TasksService } from "./tasks.service";

type PrismaMock = {
  $transaction: jest.Mock;
  project: { findUnique: jest.Mock };
  projectMember: { findUnique: jest.Mock };
  task: {
    findMany: jest.Mock;
    count: jest.Mock;
    create: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
  };
};

const PROJECT_ID = "11111111-1111-4111-8111-111111111111";
const TASK_ID = "22222222-2222-4222-8222-222222222221";
const ASSIGNEE_ID = "33333333-3333-4333-8333-333333333331";
const MANAGER_ID = "33333333-3333-4333-8333-333333333332";
const MEMBER_ID = "33333333-3333-4333-8333-333333333333";

function createPrismaMock(): PrismaMock {
  return {
    $transaction: jest.fn((operations: Promise<unknown>[]) =>
      Promise.all(operations),
    ),
    project: { findUnique: jest.fn() },
    projectMember: { findUnique: jest.fn() },
    task: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
}

function createService(prisma: PrismaMock) {
  return new TasksService(prisma as unknown as PrismaService);
}

function authUser(id: string, role: UserRole = UserRole.MEMBER): AuthUser {
  return { id, role, email: `${id}@teamsync.dev` };
}

describe("TasksService", () => {
  let prisma: PrismaMock;
  let service: TasksService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = createService(prisma);
  });

  describe("findForProject", () => {
    it("builds the task query from status, priority, assignee, pagination, and sorting", async () => {
      const tasks = [{ id: TASK_ID, title: "Build filters" }];
      prisma.projectMember.findUnique.mockResolvedValue({
        projectId: PROJECT_ID,
        userId: MEMBER_ID,
        role: ProjectRole.MEMBER,
      });
      prisma.task.findMany.mockResolvedValue(tasks);
      prisma.task.count.mockResolvedValue(25);

      const query = {
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        assignee: ASSIGNEE_ID,
        page: 3,
        limit: 10,
        sortBy: "priority",
        sortOrder: "desc",
      } as TaskQueryDto;

      const result = await service.findForProject(
        PROJECT_ID,
        query,
        authUser(MEMBER_ID),
      );

      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: {
          projectId: PROJECT_ID,
          status: TaskStatus.TODO,
          priority: TaskPriority.HIGH,
          assigneeId: ASSIGNEE_ID,
        },
        include: {
          assignee: { select: { id: true, name: true, email: true } },
        },
        orderBy: { priority: "desc" },
        skip: 20,
        take: 10,
      });

      expect(prisma.task.count).toHaveBeenCalledWith({
        where: {
          projectId: PROJECT_ID,
          status: TaskStatus.TODO,
          priority: TaskPriority.HIGH,
          assigneeId: ASSIGNEE_ID,
        },
      });

      expect(result).toEqual({
        data: tasks,
        meta: { page: 3, limit: 10, total: 25, totalPages: 3 },
      });
    });
  });

  describe("create", () => {
    const dto: CreateTaskDto = {
      title: "Create dashboard",
      description: "Build task filters",
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      assigneeId: ASSIGNEE_ID,
      dueDate: "2026-06-26T12:00:00.000Z",
    };

    it("allows a project manager to create a task for a project member", async () => {
      const createdTask = { id: TASK_ID, ...dto };
      prisma.projectMember.findUnique
        .mockResolvedValueOnce({ role: ProjectRole.MANAGER })
        .mockResolvedValueOnce({ role: ProjectRole.MANAGER })
        .mockResolvedValueOnce({ userId: ASSIGNEE_ID });
      prisma.task.create.mockResolvedValue(createdTask);

      const result = await service.create(
        PROJECT_ID,
        dto,
        authUser(MANAGER_ID, UserRole.MANAGER),
      );

      expect(prisma.task.create).toHaveBeenCalledWith({
        data: {
          projectId: PROJECT_ID,
          title: dto.title,
          description: dto.description,
          status: dto.status,
          priority: dto.priority,
          assigneeId: dto.assigneeId,
          dueDate: new Date(dto.dueDate!),
        },
        include: {
          assignee: { select: { id: true, name: true, email: true } },
        },
      });

      expect(result).toBe(createdTask);
    });

    it("allows a project member to create a task assigned to themselves", async () => {
      prisma.projectMember.findUnique
        .mockResolvedValueOnce({ role: ProjectRole.MEMBER })
        .mockResolvedValueOnce({ role: ProjectRole.MEMBER })
        .mockResolvedValueOnce({ userId: MEMBER_ID });
      prisma.task.create.mockResolvedValue({ id: TASK_ID });

      await expect(
        service.create(
          PROJECT_ID,
          { ...dto, assigneeId: MEMBER_ID },
          authUser(MEMBER_ID),
        ),
      ).resolves.toEqual({ id: TASK_ID });
    });

    it("rejects a project member creating a task for another user", async () => {
      prisma.projectMember.findUnique
        .mockResolvedValueOnce({ role: ProjectRole.MEMBER })
        .mockResolvedValueOnce({ role: ProjectRole.MEMBER });

      await expect(
        service.create(PROJECT_ID, dto, authUser(MEMBER_ID)),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.task.create).not.toHaveBeenCalled();
    });
  });

  describe("update", () => {
    const existingTask = {
      id: TASK_ID,
      projectId: PROJECT_ID,
      assigneeId: ASSIGNEE_ID,
    };

    const dto: UpdateTaskDto = {
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
    };

    beforeEach(() => {
      prisma.task.findUnique.mockResolvedValue(existingTask);
      prisma.task.update.mockResolvedValue({ ...existingTask, ...dto });
    });

    it("allows the task assignee to update the task", async () => {
      prisma.projectMember.findUnique.mockResolvedValue({
        role: ProjectRole.MEMBER,
      });

      await expect(
        service.update(TASK_ID, dto, authUser(ASSIGNEE_ID)),
      ).resolves.toEqual({ ...existingTask, ...dto });
      expect(prisma.task.update).toHaveBeenCalled();
    });

    it("allows a project manager to update the task", async () => {
      prisma.projectMember.findUnique.mockResolvedValue({
        role: ProjectRole.MANAGER,
      });

      await expect(
        service.update(TASK_ID, dto, authUser(MANAGER_ID, UserRole.MANAGER)),
      ).resolves.toEqual({ ...existingTask, ...dto });
      expect(prisma.task.update).toHaveBeenCalled();
    });

    it("allows an admin to update the task", async () => {
      prisma.projectMember.findUnique.mockResolvedValue(null);

      await expect(
        service.update(TASK_ID, dto, authUser("admin-user", UserRole.ADMIN)),
      ).resolves.toEqual({ ...existingTask, ...dto });
      expect(prisma.task.update).toHaveBeenCalled();
    });

    it("rejects a non-assignee project member", async () => {
      prisma.projectMember.findUnique.mockResolvedValue({
        role: ProjectRole.MEMBER,
      });

      await expect(
        service.update(TASK_ID, dto, authUser(MEMBER_ID)),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.task.update).not.toHaveBeenCalled();
    });
  });
});
