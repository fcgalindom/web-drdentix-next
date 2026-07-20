'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, AuthUser } from '@/lib/auth';

export function useAuth(requiredRole?: 'Administrator' | 'Dentist' | 'Patient') {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.replace('/login');
      return;
    }
    if (requiredRole && u.type_user !== requiredRole) {
      router.replace('/login');
      return;
    }
    setUser(u);
    setLoading(false);
  }, [requiredRole, router]);

  return { user, loading };
}
