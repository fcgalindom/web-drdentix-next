'use client';
import { useAuth } from '@/hooks/useAuth';
import { BarChart3 } from 'lucide-react';

export default function ReportesPage() {
  const { loading } = useAuth('Administrator');
  if (loading) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#0F172A] mb-6">Reportes</h1>
      <div className="bg-white rounded-xl shadow-sm p-12 flex flex-col items-center justify-center text-gray-400 gap-3">
        <BarChart3 size={48} strokeWidth={1} />
        <p className="text-sm">Módulo de reportes — próximamente</p>
      </div>
    </div>
  );
}
