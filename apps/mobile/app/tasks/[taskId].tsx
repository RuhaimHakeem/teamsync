import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { getCurrentUser, getTaskDetail } from '../../src/lib/api';
import { clearTokens, getAccessToken } from '../../src/lib/authStorage';
import { TaskDetailScreen } from '../../src/screens/TaskDetailScreen';
import type { TaskDetail, User } from '../../src/types';

export default function TaskDetailRoute() {
  const router = useRouter();
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [taskDetail, setTaskDetail] = useState<TaskDetail | null>(null);
  const [commentBody, setCommentBody] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);

  useEffect(() => {
    void loadTaskDetail();
  }, [taskId]);

  async function loadTaskDetail() {
    const accessToken = await getAccessToken();
    if (!accessToken || !taskId) {
      router.replace('/login');
      return;
    }

    try {
      const [currentUser, detail] = await Promise.all([
        getCurrentUser(),
        getTaskDetail(taskId),
      ]);
      setUser(currentUser);
      setTaskDetail(detail);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        await clearTokens();
        router.replace('/login');
        return;
      }

      Alert.alert('Could not load task', error instanceof Error ? error.message : 'Try again.');
      router.back();
    }
  }

  return (
    <TaskDetailScreen
      commentBody={commentBody}
      isAddingComment={isAddingComment}
      onAddingCommentChange={setIsAddingComment}
      onBack={() => router.back()}
      onCommentBodyChange={setCommentBody}
      onOptimisticComment={setTaskDetail}
      taskDetail={taskDetail}
      user={user}
    />
  );
}
