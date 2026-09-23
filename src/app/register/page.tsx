import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/session';
import AuthForm from '@/components/auth-form';
export default async function RegisterPage() {
  if (await currentUser()) redirect('/');
  return <AuthForm mode="register" />;
}
