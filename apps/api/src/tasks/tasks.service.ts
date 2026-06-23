import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, ProjectRole, UserRole } from "@prisma/client";
import { AuthUser } from "../auth/types/auth-user";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { CreateTaskDto } from "./dto/create-task.dto";
import { TaskQueryDto } from "./dto/task-query.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async findForProject(projectId: string, query: TaskQueryDto, user: AuthUser) {
    await this.assertProjectAccess(projectId, user);

    const where: Prisma.TaskWhereInput = {
      projectId,
      status: query.status,
      priority: query.priority,
      assigneeId: query.assignee,
    };
    const orderBy: Prisma.TaskOrderByWithRelationInput = {
      [query.sortBy]: query.sortOrder,
    };
    const skip = (query.page - 1) * query.limit;

    const [tasks, total] = await this.prisma.$transaction([
      this.prisma.task.findMany({
        where,
        include: {
          assignee: { select: { id: true, name: true, email: true } },
        },
        orderBy,
        skip,
        take: query.limit,
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      data: tasks,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async create(projectId: string, dto: CreateTaskDto, user: AuthUser) {
    await this.assertProjectAccess(projectId, user);
    const membership = await this.getMembership(projectId, user);
    const canCreate =
      user.role === UserRole.ADMIN ||
      membership?.role === ProjectRole.MANAGER ||
      dto.assigneeId === user.id;

    if (!canCreate) {
      throw new ForbiddenException(
        "Only the assignee, project manager, or admin can create this task",
      );
    }

    await this.assertProjectMember(
      projectId,
      dto.assigneeId,
      "Assignee must belong to the project",
    );

    return this.prisma.task.create({
      data: {
        projectId,
        title: dto.title,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        assigneeId: dto.assigneeId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
      include: { assignee: { select: { id: true, name: true, email: true } } },
    });
  }

  async findOne(taskId: string, user: AuthUser) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        comments: {
          include: {
            author: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!task) {
      throw new NotFoundException("Task not found");
    }

    await this.assertProjectAccess(task.projectId, user);
    return task;
  }

  async update(taskId: string, dto: UpdateTaskDto, user: AuthUser) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException("Task not found");
    }

    const membership = await this.getMembership(task.projectId, user);
    const canUpdate =
      user.role === UserRole.ADMIN ||
      task.assigneeId === user.id ||
      membership?.role === ProjectRole.MANAGER;

    if (!canUpdate) {
      throw new ForbiddenException("You cannot update this task");
    }

    if (dto.assigneeId) {
      await this.assertProjectMember(
        task.projectId,
        dto.assigneeId,
        "Assignee must belong to the project",
      );
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        assigneeId: dto.assigneeId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
      include: { assignee: { select: { id: true, name: true, email: true } } },
    });
  }

  async addComment(taskId: string, dto: CreateCommentDto, user: AuthUser) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { projectId: true },
    });
    if (!task) {
      throw new NotFoundException("Task not found");
    }

    await this.assertProjectAccess(task.projectId, user);

    return this.prisma.comment.create({
      data: { taskId, authorId: user.id, body: dto.body },
      include: { author: { select: { id: true, name: true, email: true } } },
    });
  }

  private async assertProjectAccess(projectId: string, user: AuthUser) {
    if (user.role === UserRole.ADMIN) {
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
        select: { id: true },
      });
      if (!project) {
        throw new NotFoundException("Project not found");
      }
      return;
    }

    const membership = await this.getMembership(projectId, user);
    if (!membership) {
      throw new ForbiddenException("You do not have access to this project");
    }
  }

  private getMembership(projectId: string, user: AuthUser) {
    return this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: user.id } },
    });
  }

  private async assertProjectMember(
    projectId: string,
    userId: string,
    message: string,
  ) {
    const membership = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
      select: { userId: true },
    });
    if (!membership) {
      throw new ForbiddenException(message);
    }
  }
}
