import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AuthUser } from "../auth/types/auth-user";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { CreateTaskDto } from "./dto/create-task.dto";
import { TaskQueryDto } from "./dto/task-query.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { TasksService } from "./tasks.service";

@Controller()
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get("projects/:projectId/tasks")
  findForProject(
    @Param("projectId", ParseUUIDPipe) projectId: string,
    @Query() query: TaskQueryDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.tasksService.findForProject(projectId, query, user);
  }

  @Post("projects/:projectId/tasks")
  create(
    @Param("projectId", ParseUUIDPipe) projectId: string,
    @Body() dto: CreateTaskDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.tasksService.create(projectId, dto, user);
  }

  @Get("tasks/me")
  findAssignedToMe(@CurrentUser() user: AuthUser) {
    return this.tasksService.findAssignedToMe(user);
  }

  @Get("tasks/:taskId")
  findOne(
    @Param("taskId", ParseUUIDPipe) taskId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.tasksService.findOne(taskId, user);
  }

  @Patch("tasks/:taskId")
  update(
    @Param("taskId", ParseUUIDPipe) taskId: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.tasksService.update(taskId, dto, user);
  }

  @Post("tasks/:taskId/comments")
  addComment(
    @Param("taskId", ParseUUIDPipe) taskId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.tasksService.addComment(taskId, dto, user);
  }
}
