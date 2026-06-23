import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Task } from '../types';

const CACHED_TASKS_KEY = 'teamsync_cached_tasks';

export async function cacheTasks(tasks: Task[]) {
  await AsyncStorage.setItem(CACHED_TASKS_KEY, JSON.stringify(tasks));
}

export async function getCachedTasks() {
  const cachedTasks = await AsyncStorage.getItem(CACHED_TASKS_KEY);
  return cachedTasks ? (JSON.parse(cachedTasks) as Task[]) : null;
}

export async function clearCachedTasks() {
  await AsyncStorage.removeItem(CACHED_TASKS_KEY);
}
