import type {
  AuthResponse,
  PaginatedTasks,
  Project,
  Task,
  TaskDetail,
  TaskStatus,
  User,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type ApiOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

async function parseResponse(response: Response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function refreshTokens() {
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });

  return response.ok;
}

export async function apiFetch<T>(
  path: string,
  options: ApiOptions = {},
  shouldRetry = true,
): Promise<T> {
  const {
    auth = true,
    body,
    headers: incomingHeaders,
    ...fetchOptions
  } = options;
  const headers = new Headers(incomingHeaders);

  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    credentials: "include",
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (
    response.status === 401 &&
    auth &&
    shouldRetry &&
    (await refreshTokens())
  ) {
    return apiFetch<T>(path, options, false);
  }

  const data = await parseResponse(response);

  if (!response.ok) {
    if (response.status === 401) {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    const message =
      data && typeof data === "object" && "message" in data
        ? Array.isArray(data.message)
          ? data.message.join(", ")
          : String(data.message)
        : "Something went wrong";

    throw new ApiError(response.status, message, data);
  }

  return data as T;
}

export function login(email: string, password: string, rememberMe: boolean) {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: { email, password, rememberMe },
    auth: false,
  });
}

export function registerAccount(
  name: string,
  email: string,
  password: string,
  rememberMe: boolean,
) {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: { name, email, password, rememberMe },
    auth: false,
  });
}

export function logout() {
  return apiFetch<void>("/auth/logout", {
    method: "POST",
    auth: false,
  });
}

export function getCurrentUser() {
  return apiFetch<User>("/auth/me");
}

export function getProjects() {
  return apiFetch<Project[]>("/projects");
}

export function getProjectTasks(projectId: string, query: URLSearchParams) {
  const queryString = query.toString();
  return apiFetch<PaginatedTasks>(
    `/projects/${projectId}/tasks${queryString ? `?${queryString}` : ""}`,
  );
}

export function getTask(taskId: string) {
  return apiFetch<TaskDetail>(`/tasks/${taskId}`);
}

export function updateTaskStatus(taskId: string, status: TaskStatus) {
  return apiFetch<Task>(`/tasks/${taskId}`, {
    method: "PATCH",
    body: { status },
  });
}

export function addComment(taskId: string, body: string) {
  return apiFetch(`/tasks/${taskId}/comments`, {
    method: "POST",
    body: { body },
  });
}
