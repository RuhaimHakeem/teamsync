import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { REFRESH_TOKEN_COOKIE } from '../lib/auth';

export default async function Home() {
  const cookieStore = await cookies();
  const hasSession = Boolean(cookieStore.get(REFRESH_TOKEN_COOKIE)?.value);

  redirect(hasSession ? '/dashboard' : '/login');
}
