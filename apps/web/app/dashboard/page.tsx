import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DashboardShell } from '../../components/DashboardShell';
import { REFRESH_TOKEN_COOKIE } from '../../lib/auth';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const hasSession = Boolean(cookieStore.get(REFRESH_TOKEN_COOKIE)?.value);

  if (!hasSession) {
    redirect('/login');
  }

  return <DashboardShell />;
}
