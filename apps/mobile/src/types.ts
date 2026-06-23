export type User = {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'MEMBER';
};

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

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
  project?: { id: string; name: string };
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
  assignee: Pick<User, 'id' | 'name' | 'email'>;
};

export type AuthResponse = {
  user: User;
  accessToken: string;
  refreshToken: string;
};
