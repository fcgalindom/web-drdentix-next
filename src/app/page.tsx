'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from '@/lib/auth';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const user = getUser();
    if (!user) { router.replace('/login'); return; }
    if (user.type_user === 'Administrator') router.replace('/admin/citas');
    else if (user.type_user === 'Dentist')  router.replace('/dentist/citas');
    else                                    router.replace('/patient/citas');
  }, [router]);
  return null;
}
