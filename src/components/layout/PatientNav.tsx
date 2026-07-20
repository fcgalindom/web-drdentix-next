'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { clearSession, getUser } from '@/lib/auth';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

export default function PatientNav() {
  const path = usePathname();
  const router = useRouter();
  const user = getUser();
  const isDentist = user?.type_user === 'Dentist';

  async function logout() {
    await api.post('/auth/logout').catch(() => {});
    clearSession();
    router.replace('/login');
  }

  const links = isDentist
    ? [
        { href: '/dentist/perfil',  label: 'MI PERFIL' },
        { href: '/dentist/citas',   label: 'MIS CITAS' },
        { href: '/dentist/horario', label: 'MI HORARIO' },
      ]
    : [
        { href: '/patient/perfil',  label: 'MI PERFIL' },
        { href: '/patient/citas/nueva', label: 'AGENDAR CITA' },
        { href: '/patient/citas',   label: 'MIS CITAS' },
      ];

  return (
    <nav className="bg-[#013253] shadow">
      <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href={isDentist ? '/dentist/citas' : '/patient/citas'} className="text-white font-bold text-xl">
          Dr. Dentix
        </Link>
        <div className="flex items-center gap-6">
          {links.map(({ href, label }) => (
            <Link key={href} href={href}
              className={cn(
                'text-sm font-bold transition-colors',
                path.startsWith(href) ? 'text-[#00AFF1]' : 'text-white hover:text-[#00AFF1]'
              )}>
              {label}
            </Link>
          ))}
          <button onClick={logout} className="text-white hover:text-red-400 transition-colors ml-2">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
}
