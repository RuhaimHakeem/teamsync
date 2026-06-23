import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { getCurrentUser, getMyTasks } from "../src/lib/api";
import { clearTokens, getAccessToken } from "../src/lib/authStorage";
import {
  cacheTasks,
  clearCachedTasks,
  getCachedTasks,
} from "../src/lib/taskCache";
import { DashboardScreen } from "../src/screens/DashboardScreen";
import type { Task, User } from "../src/types";

export default function DashboardRoute() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isShowingCachedData, setIsShowingCachedData] = useState(false);
  const [taskError, setTaskError] = useState("");

  useFocusEffect(
    useCallback(() => {
      void loadDashboard();
    }, []),
  );

  async function loadDashboard() {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      router.replace("/login");
      return;
    }

    try {
      setUser(await getCurrentUser());
      await loadTasks();
    } catch {
      await clearTokens();
      router.replace("/login");
    }
  }

  async function loadTasks(isPullToRefresh = false) {
    setTaskError("");
    setIsShowingCachedData(false);
    isPullToRefresh ? setIsRefreshing(true) : setIsLoadingTasks(true);

    try {
      const assignedTasks = await getMyTasks();
      setTasks(assignedTasks);
      await cacheTasks(assignedTasks);
    } catch (error) {
      const cachedTasks = await getCachedTasks();
      if (cachedTasks) {
        setTasks(cachedTasks);
        setIsShowingCachedData(true);
        setTaskError(
          "Unable to load the latest information. Showing previously saved data instead.",
        );
      } else {
        setTaskError(
          error instanceof Error ? error.message : "Could not load tasks.",
        );
      }
    } finally {
      setIsLoadingTasks(false);
      setIsRefreshing(false);
    }
  }

  async function handleLogout() {
    await clearTokens();
    await clearCachedTasks();
    setUser(null);
    setTasks([]);
    router.replace("/login");
  }

  return (
    <DashboardScreen
      error={taskError}
      isLoading={isLoadingTasks}
      isRefreshing={isRefreshing}
      isShowingCachedData={isShowingCachedData}
      onLogout={() => void handleLogout()}
      onOpenTask={(taskId) => router.push(`/tasks/${taskId}`)}
      onRefresh={() => void loadTasks(true)}
      tasks={tasks}
      user={user}
    />
  );
}
