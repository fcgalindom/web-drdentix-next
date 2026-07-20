'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Paginator from '@/components/ui/Paginator';
import toast from 'react-hot-toast';
import { parseCOP, formatDate } from '@/lib/utils';

interface Appointment {
  id: number; day: string; hour: string; state: string; pay: number;
  branch: { name: string; address: string };
  patient: { name: string; telephone: string; user: { document: string; email: string } };
  dentist_procedure: { dentist: { name: string }; procedure: { name: string; id: number } };
}

export default function DentistCitasPage() {
  const { loading } = useAuth('Dentist');
  const [items, setItems] = useState<Appointment[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [payModal, setPayModal] = useState(false);
  const [price, setPrice] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    const params: any = {};
    if (filter) params.date = filter;
    const { data } = await api.get('/dentist/appointments', { params });
    setItems(Array.isArray(data) ? data : data.data ?? []);
    setMeta(data.meta ?? null);
  }

  useEffect(() => { if (!loading) load(); }, [loading]);

  async function changeState(state: string) {
    if (!selected) return;
    setSaving(true);
    try {
      const body: any = { id: selected.id, state };
      if (state === 'Asistio' && price) {
        body.payments = [{ price: Number(price), procedure_id: selected.dentist_procedure?.procedure?.id }];
      }
      await api.post('/dentist/appointments/state', body);
      toast.success('Estado actualizado');
      setPayModal(false); setSelected(null); setPrice('');
      load();
    } catch (e: any) { toast.error(e.response?.data?.message ?? 'Error'); }
    finally { setSaving(false); }
  }

  if (loading) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#013253]">Mis citas</h1>
        <div className="flex gap-2">
          <Input type="date" value={filter} onChange={(e) => setFilter(e.target.value)} />
          <Button onClick={load}>Filtrar</Button>
          <Button variant="ghost" onClick={() => { setFilter(''); load(); }}>Hoy</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((a) => (
          <div key={a.id} className={`bg-white rounded-xl shadow-sm p-5 ${a.state === 'Pagado' ? 'border-l-4 border-[#7CB91D]' : a.state === 'Cancelado' ? 'border-l-4 border-red-400' : 'border-l-4 border-[#00AFF1]'}`}>
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-bold text-[#013253] text-lg">{a.patient?.name}</h3>
              <Badge state={a.state} />
            </div>
            <div className="grid grid-cols-2 gap-y-1 text-sm">
              <div><span className="text-gray-500">Procedimiento:</span> {a.dentist_procedure?.procedure?.name}</div>
              <div><span className="text-gray-500">Hora:</span> {a.hour}</div>
              <div><span className="text-gray-500">Cédula:</span> {a.patient?.user?.document}</div>
              <div><span className="text-gray-500">Contacto:</span> {a.patient?.telephone}</div>
              <div><span className="text-gray-500">Día:</span> {formatDate(a.day)}</div>
              <div><span className="text-gray-500">Precio:</span> {parseCOP(a.pay)}</div>
              <div><span className="text-gray-500">Email:</span> {a.patient?.user?.email ?? '—'}</div>
              <div><span className="text-gray-500">Sede:</span> {a.branch?.name}</div>
            </div>
            {(a.state === 'Activo' || a.state === 'Recordado') && (
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="danger" onClick={() => { setSelected(a); changeState('No asistio'); }}>No asistió</Button>
                <Button size="sm" onClick={() => { setSelected(a); setPayModal(true); }}>Asistió / Pagar</Button>
              </div>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-2 bg-white rounded-xl p-12 text-center text-gray-400">No hay citas para mostrar</div>
        )}
      </div>

      {meta && <div className="mt-4"><Paginator meta={meta} onChange={() => {}} /></div>}

      <Modal open={payModal} onClose={() => setPayModal(false)} title="Registrar pago" size="sm">
        <div className="space-y-4">
          {selected && <p className="text-sm text-gray-600">Cita de <strong>{selected.patient?.name}</strong> — {selected.dentist_procedure?.procedure?.name}</p>}
          <Input label="Precio *" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Ej: 120000" />
          <Button onClick={() => changeState('Asistio')} loading={saving} className="w-full justify-center">Registrar pago</Button>
        </div>
      </Modal>
    </div>
  );
}
