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
    <aside className="w-56 shrink-0 bg-[#013253] min-h-screen pt-4">
      {adminLinks.map(({ href, label, icon: Icon }) => {
        const active = path.startsWith(href);
        return (
          <Link key={href} href={href}
            className={cn(
              'flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors',
              active ? 'bg-white/10 text-white border-r-4 border-[#7CB91D]' : 'text-white/70 hover:text-white hover:bg-white/5'
            )}>
            <Icon size={17} />
            {label}
          </Link>
        );
      })}
    </aside>
  );
}
