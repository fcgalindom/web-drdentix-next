'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, UserRound, Users, Stethoscope, CalendarDays, Package, Tag, BarChart3, Shield, Key, UserCog } from 'lucide-react';
import { cn } from '@/lib/utils';

const mainLinks = [
  { href: '/admin/citas',         label: 'Citas',           icon: CalendarDays },
  { href: '/admin/pacientes',     label: 'Pacientes',       icon: Users },
  { href: '/admin/odontologos',   label: 'Odontólogos',     icon: Stethoscope },
  { href: '/admin/sedes',         label: 'Sedes',           icon: Building2 },
  { href: '/admin/procedimientos',label: 'Procedimientos',  icon: UserRound },
  { href: '/admin/productos',     label: 'Productos',       icon: Package },
  { href: '/admin/promociones',   label: 'Promociones',     icon: Tag },
  { href: '/admin/reportes',      label: 'Reportes',        icon: BarChart3 },
] as const;

const configLinks = [
  { href: '/admin/usuarios',      label: 'Usuarios',        icon: UserCog },
  { href: '/admin/roles',         label: 'Roles',           icon: Shield },
  { href: '/admin/permisos',      label: 'Permisos',        icon: Key },
] as const;

function SidebarSection({ links }: { links: readonly { readonly href: string; readonly label: string; readonly icon: any }[] }) {
  const path = usePathname();
  return links.map(({ href, label, icon: Icon }) => {
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
  });
}

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 bg-[#013253] min-h-screen pt-4">
      <SidebarSection links={mainLinks} />
      <div className="mx-4 my-2 border-t border-white/10" />
      <SidebarSection links={configLinks} />
    </aside>
  );
}
