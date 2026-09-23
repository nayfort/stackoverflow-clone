import { notFound } from 'next/navigation';
import { getStore } from '@/lib/db';
import { getViewer } from '@/lib/session';
import ProfileView from '@/components/profile';
export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const profile = getStore().profile((await params).id, await getViewer());
  if (!profile) notFound();
  return <ProfileView profile={profile} />;
}
