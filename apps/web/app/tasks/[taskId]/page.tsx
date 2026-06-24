import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { TaskDetail } from '../../../components/TaskDetail';
import { REFRESH_TOKEN_COOKIE } from '../../../lib/auth';

type TaskDetailPageProps = {
  params: Promise<{ taskId: string }>;
  searchParams: Promise<{ projectId?: string }>;
};

export default async function TaskDetailPage({
  params,
  searchParams,
}: TaskDetailPageProps) {
  const cookieStore = await cookies();
  const hasSession = Boolean(cookieStore.get(REFRESH_TOKEN_COOKIE)?.value);

  if (!hasSession) {
    redirect('/login');
  }

  const { taskId } = await params;
  const { projectId } = await searchParams;
  return <TaskDetail taskId={taskId} returnProjectId={projectId} />;
}
