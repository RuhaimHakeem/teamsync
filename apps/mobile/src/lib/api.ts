import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from "./authStorage";
import type { AuthResponse, Comment, Task, TaskDetail, User } from "../types";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3001";

async function refreshAccessToken() {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return false;

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken, returnTokens: true }),
  });

  if (!response.ok) {
    await clearTokens();
    return false;
  }

  const auth = (await response.json()) as AuthResponse;
  await saveTokens(auth);
  return true;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const accessToken = await getAccessToken();
  const headers = new Headers(options.headers);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (response.status === 401 && retry && (await refreshAccessToken())) {
    return apiFetch<T>(path, options, false);
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message ?? "Request failed");
  }

  return data as T;
}

export function login(email: string, password: string) {
  return apiFetch<AuthResponse>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        returnTokens: true,
        rememberMe: true,
      }),
    },
    false,
  );
}

export function getCurrentUser() {
  return apiFetch<User>("/auth/me");
}

export function getMyTasks() {
  return apiFetch<Task[]>("/tasks/me");
}

export function getTaskDetail(taskId: string) {
  return apiFetch<TaskDetail>(`/tasks/${taskId}`);
}

export function createComment(taskId: string, body: string) {
  return apiFetch<Comment>(`/tasks/${taskId}/comments`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
}
