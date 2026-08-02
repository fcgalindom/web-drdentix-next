'use client';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Meta { current_page: number; last_page: number; total: number; per_page: number; from: number; to: number; }

export default function Paginator({ meta, onChange }: { meta: Meta; onChange: (page: number) => void }) {
  if (meta.per_page >= meta.total) return null;

  const pages: number[] = [];
  for (let i = Math.max(1, meta.current_page - 2); i <= Math.min(meta.last_page, meta.current_page + 2); i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-between py-3 px-1">
      <p className="text-xs text-gray-500">
        Viendo {meta.from}–{meta.to} de {meta.total} registros
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(meta.current_page - 1)} disabled={meta.current_page === 1}
          className="p-1 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-40">
          <ChevronLeft size={16} />
        </button>
        {pages.map((p) => (
          <button key={p} onClick={() => onChange(p)}
            className={`w-7 h-7 text-xs rounded-lg font-semibold transition-all ${p === meta.current_page ? 'bg-[#0EA5E9] text-white shadow-sm' : 'hover:bg-[#F0F9FF] text-slate-600'}`}>
            {p}
          </button>
        ))}
        <button onClick={() => onChange(meta.current_page + 1)} disabled={meta.current_page === meta.last_page}
          className="p-1 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-40">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
