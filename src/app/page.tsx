'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getUser } from '@/lib/auth';
import { Calendar, Bell, Zap, CheckCircle, Star } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (user) {
      if (user.type_user === 'Administrator') router.replace('/admin/citas');
      else if (user.type_user === 'Dentist')  router.replace('/dentist/citas');
      else                                    router.replace('/patient/citas');
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) return null;

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-extrabold text-[#0F172A] text-lg" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Dr. Dentix
          </span>
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-500 font-medium">
            <a href="#funciones" className="hover:text-[#0EA5E9] transition-colors">Funciones</a>
            <a href="#precios" className="hover:text-[#0EA5E9] transition-colors">Precios</a>
            <a href="#testimonios" className="hover:text-[#0EA5E9] transition-colors">Testimonios</a>
          </nav>
          <Link href="/login"
            className="px-4 py-2 bg-[#0EA5E9] text-white text-sm font-semibold rounded-lg hover:bg-[#0284C7] transition-colors">
            Empezar
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-28 pb-20 bg-[#F0F9FF]">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#0F172A] leading-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Consigue más citas sin mover un dedo
            </h1>
            <p className="text-slate-500 text-lg leading-relaxed">
              Automatizamos tu agenda para que te concentres en lo que importa.
              Un sistema diseñado para gestionar pacientes, citas y odontólogos de forma eficiente.
            </p>
            <Link href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#0EA5E9] text-white font-semibold rounded-lg hover:bg-[#0284C7] transition-colors text-sm shadow-sm">
              Prueba gratis 14 días
            </Link>
          </div>
          <div className="flex-1 w-full">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100">
              <div className="text-center mb-4">
                <p className="text-xs font-semibold text-[#0EA5E9] uppercase tracking-widest">AUTOMATED SCHEDULING</p>
                <p className="text-sm font-bold text-[#0F172A]">Dr. Dentix</p>
              </div>
              <div className="grid grid-cols-5 gap-1 text-xs">
                {['Lun 14', 'Mar 15', 'Mie 16', 'Jue 17', 'Vie 18'].map((d, i) => (
                  <div key={d} className={`text-center py-1 rounded font-semibold ${i === 1 ? 'bg-[#0EA5E9] text-white' : 'text-slate-400'}`}>{d}</div>
                ))}
              </div>
              <div className="mt-3 space-y-2">
                {[
                  { time: '09:00', name: 'G. Ramos', proc: 'Limpieza', color: 'bg-blue-100 text-blue-700' },
                  { time: '10:00', name: 'R. Vega', proc: 'Ortodoncia', color: 'bg-[#0EA5E9]/10 text-[#0369A1]' },
                  { time: '12:00', name: 'Bloqueado', proc: 'Almuerzo', color: 'bg-red-100 text-red-600' },
                  { time: '15:00', name: 'J. Castillo', proc: 'Cirugía', color: 'bg-violet-100 text-violet-700' },
                ].map(({ time, name, proc, color }) => (
                  <div key={time} className={`flex items-center gap-3 px-3 py-2 rounded-lg ${color}`}>
                    <span className="text-xs font-mono w-10">{time}</span>
                    <div>
                      <p className="text-xs font-semibold">{name}</p>
                      <p className="text-xs opacity-70">{proc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="funciones" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#0F172A]" style={{ fontFamily: 'Manrope, sans-serif' }}>Todo lo que necesitas</h2>
            <p className="text-slate-500 mt-3 text-sm max-w-md mx-auto">
              Nuestras herramientas están diseñadas para reducir el trabajo manual y aumentar la eficiencia.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Zap size={22} className="text-[#0EA5E9]" />,
                title: 'Automatización inteligente',
                desc: 'Nuestro sistema organiza la agenda y sugiere los mejores horarios automáticamente.',
              },
              {
                icon: <Calendar size={22} className="text-[#0EA5E9]" />,
                title: 'Gestión de citas centralizada',
                desc: 'Administra citas, odontólogos y sedes desde un solo panel con total claridad.',
              },
              {
                icon: <Bell size={22} className="text-[#0EA5E9]" />,
                title: 'Control de inventario',
                desc: 'Gestiona productos médicos con semáforo de vencimiento y control de stock.',
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-[#F0F9FF] rounded-xl p-6 border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm mb-4">
                  {icon}
                </div>
                <h3 className="font-bold text-[#0F172A] mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precios" className="py-20 bg-[#F0F9FF]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#0F172A]" style={{ fontFamily: 'Manrope, sans-serif' }}>Planes simples y transparentes</h2>
            <p className="text-slate-500 mt-3 text-sm">Elige el plan que mejor se adapte al tamaño de tu negocio.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 items-start">
            {/* Básico */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="font-bold text-[#0F172A] text-lg">Básico</h3>
              <div className="mt-3 mb-6">
                <span className="text-3xl font-extrabold text-[#0F172A]">$19</span>
                <span className="text-slate-400 text-sm">/mes</span>
              </div>
              <ul className="space-y-2 mb-6">
                {['Hasta 100 citas al mes', '1 Odontólogo conectado'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle size={14} className="text-[#0EA5E9] flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="block text-center py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                Elegir Básico
              </Link>
            </div>

            {/* Pro (destacado) */}
            <div className="bg-[#0F172A] rounded-2xl p-6 shadow-xl relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0EA5E9] text-white text-xs font-bold px-3 py-1 rounded-full">Más popular</span>
              <h3 className="font-bold text-white text-lg">Pro</h3>
              <div className="mt-3 mb-6">
                <span className="text-3xl font-extrabold text-white">$49</span>
                <span className="text-slate-400 text-sm">/mes</span>
              </div>
              <ul className="space-y-2 mb-6">
                {['Citas ilimitadas', '5 Odontólogos conectados', 'Gestión de sedes'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle size={14} className="text-[#0EA5E9] flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="block text-center py-2 bg-[#0EA5E9] text-white rounded-lg text-sm font-semibold hover:bg-[#0284C7] transition-colors">
                Elegir Pro
              </Link>
            </div>

            {/* Enterprise */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="font-bold text-[#0F172A] text-lg">Enterprise</h3>
              <p className="text-slate-400 text-sm mt-1">Personalizado</p>
              <div className="mt-3 mb-6">
                <span className="text-2xl font-extrabold text-[#0F172A]">A medida</span>
              </div>
              <ul className="space-y-2 mb-6">
                {['Todo lo de Pro', 'Soporte prioritario 24/7', 'API Access'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle size={14} className="text-[#0EA5E9] flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="block text-center py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                Contactar Ventas
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonios" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#0F172A]" style={{ fontFamily: 'Manrope, sans-serif' }}>Lo que dicen nuestros clientes</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                quote: '"Desde que uso Dr. Dentix, nuestra clínica redujo las inasistencias un 40%. La gestión de citas es simplísima."',
                name: 'María González',
                role: 'Clínica Dental Sonrisas',
              },
              {
                quote: '"La gestión centralizada de odontólogos y sedes es perfecta. Ya no tenemos cruces de horarios y ahorramos horas a la semana."',
                name: 'Carlos Ruiz',
                role: 'Director Médico',
              },
            ].map(({ quote, name, role }) => (
              <div key={name} className="bg-[#F0F9FF] rounded-2xl p-6 border border-slate-100">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className="fill-[#0EA5E9] text-[#0EA5E9]" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">{quote}</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#0EA5E9] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0F172A]">{name}</p>
                    <p className="text-xs text-slate-400">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F172A] text-white py-10">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-extrabold text-lg" style={{ fontFamily: 'Manrope, sans-serif' }}>Dr. Dentix</span>
          <p className="text-slate-400 text-sm">© 2026 Dr. Dentix. Todos los derechos reservados.</p>
          <Link href="/login" className="px-4 py-2 bg-[#0EA5E9] text-white text-sm font-semibold rounded-lg hover:bg-[#0284C7] transition-colors">
            Iniciar sesión
          </Link>
        </div>
      </footer>

    </div>
  );
}
