'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, UserRound, Users, Stethoscope, CalendarDays, Package, Tag, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const adminLinks = [
  { href: '/admin/citas',         label: 'Citas',           icon: CalendarDays },
  { href: '/admin/pacientes',     label: 'Pacientes',       icon: Users },
  { href: '/admin/odontologos',   label: 'Odontólogos',     icon: Stethoscope },
  { href: '/admin/sedes',         label: 'Sedes',           icon: Building2 },
  { href: '/admin/procedimientos',label: 'Procedimientos',  icon: UserRound },
  { href: '/admin/productos',     label: 'Productos',       icon: Package },
  { href: '/admin/promociones',   label: 'Promociones',     icon: Tag },
  { href: '/admin/reportes',      label: 'Reportes',        icon: BarChart3 },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <aside className="w-56 shrink-0 bg-[#0F172A] min-h-screen pt-6 flex flex-col gap-1">
      {adminLinks.map(({ href, label, icon: Icon }) => {
        const active = path.startsWith(href);
        return (
          <Link key={href} href={href}
            className={cn(
              'flex items-center gap-3 mx-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
              active
                ? 'bg-[#0EA5E9]/15 text-[#0EA5E9] border border-[#0EA5E9]/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            )}>
            <Icon size={16} />
            {label}
          </Link>
        );
      })}
    </aside>
  );
}
