export type UserRole = 'ADMIN' | 'MANAGER' | 'MEMBER';
export type ProjectRole = 'MANAGER' | 'MEMBER';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt?: string;
};

export type ProjectMember = {
  projectId: string;
  userId: string;
  role: ProjectRole;
  user: Pick<User, 'id' | 'name' | 'email'>;
};

export type Project = {
  id: string;
  name: string;
  description?: string | null;
  ownerId: string;
  createdAt: string;
  owner: Pick<User, 'id' | 'name' | 'email'>;
  members: ProjectMember[];
  _count?: {
    tasks: number;
  };
};

export type Task = {
  id: string;
  projectId: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  assignee: Pick<User, 'id' | 'name' | 'email'>;
};

export type Comment = {
  id: string;
  taskId: string;
  authorId: string;
  body: string;
  createdAt: string;
  author: Pick<User, 'id' | 'name' | 'email'>;
};

export type TaskDetail = Task & {
  comments: Comment[];
};

export type PaginatedTasks = {
  data: Task[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type AuthResponse = {
  user: User;
};
