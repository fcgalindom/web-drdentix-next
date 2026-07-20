'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import Badge from '@/components/ui/Badge';
import Paginator from '@/components/ui/Paginator';
import { parseCOP, formatDate } from '@/lib/utils';

interface Appointment {
  id: number; day: string; hour: string; state: string; pay: number;
  branch: { name: string };
  patient: { user: { document: string; email: string } };
  dentist_procedure: { dentist: { name: string }; procedure: { name: string } };
  invoices: { id: number }[];
}

export default function PatientCitasPage() {
  const { loading } = useAuth('Patient');
  const [items, setItems] = useState<Appointment[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [page, setPage] = useState(1);

  async function load(p = 1) {
    const { data } = await api.get(`/patient/appointments?page=${p}`);
    setItems(data.data ?? []);
    setMeta(data.meta ?? null);
  }

  useEffect(() => { if (!loading) load(); }, [loading]);

  if (loading) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#013253] mb-6">Mis citas</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((a) => (
          <div key={a.id} className={`bg-white rounded-xl shadow-sm p-5 border-l-4 ${a.state === 'Pagado' ? 'border-[#7CB91D]' : a.state === 'Cancelado' ? 'border-red-400' : 'border-[#00AFF1]'}`}>
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-bold text-[#013253]">{a.dentist_procedure?.procedure?.name}</h3>
              <Badge state={a.state} />
            </div>
            <div className="grid grid-cols-2 gap-y-1 text-sm">
              <div><span className="text-gray-500">Odontólogo:</span> {a.dentist_procedure?.dentist?.name}</div>
              <div><span className="text-gray-500">Hora:</span> {a.hour}</div>
              <div><span className="text-gray-500">Sede:</span> {a.branch?.name}</div>
              <div><span className="text-gray-500">Día:</span> {formatDate(a.day)}</div>
              {a.state === 'Pagado' && <div className="col-span-2"><span className="text-gray-500">Pagado:</span> <strong>{parseCOP(a.pay)}</strong></div>}
            </div>
            {a.state === 'Pagado' && (
              <a href={`/patient/citas/${a.id}/factura`}
                className="mt-3 inline-flex items-center gap-1 text-xs text-red-600 hover:underline">
                📄 Mi factura
              </a>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-2 bg-white rounded-xl p-12 text-center text-gray-400">No tienes citas registradas</div>
        )}
      </div>

      {meta && <div className="mt-4"><Paginator meta={meta} onChange={(p) => { setPage(p); load(p); }} /></div>}
    </div>
  );
}
