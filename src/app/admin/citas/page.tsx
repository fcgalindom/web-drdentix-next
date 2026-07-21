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
import { ChevronLeft, ChevronRight, MessageCircle, Phone, Trash2, Plus, FileText } from 'lucide-react';

interface Appointment {
  id: number; day: string; hour: string; state: string; pay: number; type_state: number;
  branch: { name: string; address: string };
  patient: { name: string; telephone: string; user: { document: string; email: string } };
  dentist_procedure: { dentist: { name: string }; procedure: { name: string; id: number } };
}

const STATES = ['Todos', 'Activo', 'Recordado', 'Cancelado', 'No asistio', 'Pagado'];

export default function CitasAdminPage() {
  const { loading } = useAuth('Administrator');
  const [items, setItems] = useState<Appointment[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [income, setIncome] = useState(0);
  const [pending, setPending] = useState(0);
  const [filters, setFilters] = useState({ patient: '', state: '', dentist_id: '', date_from: '', date_to: '' });
  const [dateOffset, setDateOffset] = useState(0);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [payModal, setPayModal] = useState(false);
  const [payments, setPayments] = useState([{ price: '', procedure_id: '' }]);
  const [saving, setSaving] = useState(false);
  const [dentists, setDentists] = useState<{ id: number; name: string }[]>([]);

  async function load(p = 1) {
    const hasDateFilter = filters.date_from || filters.date_to;
    const params: any = { page: p, ...filters };
    if (!hasDateFilter) params.advance = dateOffset;
    try {
      const { data } = await api.get('/admin/appointments', { params });
      setItems(data.data?.data ?? []);
      setMeta(data.data?.meta ?? null);
      setIncome(data.income ?? 0);
      setPending(data.pending ?? 0);
    } catch { toast.error('Error al cargar citas'); }
  }

  async function loadDentists() {
    const { data } = await api.get('/staff/dentists/select');
    setDentists(data);
  }

  useEffect(() => {
    if (!loading) { load(); loadDentists(); }
  }, [loading, dateOffset]);

  async function deleteAppt(id: number) {
    if (!confirm('¿Eliminar esta cita?')) return;
    try {
      await api.post('/admin/appointments/delete', { id });
      toast.success('Cita eliminada'); load(page);
    } catch (e: any) { toast.error(e.response?.data?.message ?? 'Error'); }
  }

  async function markWhatsapp(appt: Appointment) {
    const { data } = await api.post('/admin/appointments/whatsapp', { id: appt.id });
    const phone = appt.patient.telephone.replace(/\D/g, '');
    window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(data.message)}`, '_blank');
    load(page);
  }

  async function markPhone(id: number) {
    await api.post('/admin/appointments/phone', { id });
    toast.success('Llamada registrada'); load(page);
  }

  async function changeState(state: string) {
    if (!selected) return;
    setSaving(true);
    try {
      const body: any = { id: selected.id, state };
      if (state === 'Asistio' || state === 'Pagado') {
        body.payments = payments.filter(p => p.price && p.procedure_id).map(p => ({ price: Number(p.price), procedure_id: Number(p.procedure_id) }));
      }
      await api.post('/admin/appointments/state', body);
      toast.success('Estado actualizado');
      setPayModal(false); setSelected(null);
      load(page);
    } catch (e: any) { toast.error(e.response?.data?.message ?? 'Error'); }
    finally { setSaving(false); }
  }

  const dateLabel = () => {
    const d = new Date();
    d.setDate(d.getDate() + dateOffset);
    return d.toLocaleDateString('es-CO', { weekday: 'long', day: '2-digit', month: 'long' });
  };

  const rowClass = (state: string) => {
    if (state === 'Pagado') return 'row-pagado';
    if (state === 'Cancelado' || state === 'No asistio') return 'row-cancelado';
    return '';
  };

  if (loading) return null;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[#0F172A]">Citas</h1>
          <span className="bg-[#0369A1] text-white text-xs px-2 py-1 rounded-full">{meta?.total ?? 0}</span>
          <span className="bg-[#0F172A] text-white text-xs px-2 py-1 rounded-full">{parseCOP(income)}</span>
          <span className="text-xs text-gray-500">{pending} pendientes</span>
        </div>
        <Button onClick={() => window.location.href = '/admin/citas/nueva'}><Plus size={16} /> Nueva cita</Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-end">
        <Input label="Paciente" value={filters.patient} onChange={(e) => setFilters({ ...filters, patient: e.target.value })} />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Estado</label>
          <select value={filters.state} onChange={(e) => setFilters({ ...filters, state: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            {STATES.map(s => <option key={s} value={s === 'Todos' ? '' : s}>{s}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Odontólogo</label>
          <select value={filters.dentist_id} onChange={(e) => setFilters({ ...filters, dentist_id: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">Todos</option>
            {dentists.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <Input label="Desde" type="date" value={filters.date_from} onChange={(e) => setFilters({ ...filters, date_from: e.target.value })} />
        <Input label="Hasta" type="date" value={filters.date_to} onChange={(e) => setFilters({ ...filters, date_to: e.target.value })} />
        <Button onClick={() => { setPage(1); load(1); }}>Buscar</Button>
      </div>

      {/* Date navigator */}
      {!filters.date_from && !filters.date_to && !filters.patient && (
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setDateOffset(d => d - 1)} className="p-1.5 border rounded hover:bg-gray-100"><ChevronLeft size={16} /></button>
          <span className="text-sm font-medium text-[#0F172A] capitalize">{dateLabel()}</span>
          <button onClick={() => setDateOffset(d => d + 1)} className="p-1.5 border rounded hover:bg-gray-100"><ChevronRight size={16} /></button>
          <button onClick={() => setDateOffset(0)} className="text-xs text-[#0369A1] hover:underline ml-1">Hoy</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#0F172A] text-white">
            <tr>{['Paciente', 'Cédula', 'Teléfono', 'Odontólogo', 'Procedimiento', 'Fecha', 'Hora', 'Estado', 'Acciones'].map(h => (
              <th key={h} className="px-3 py-3 text-left font-semibold">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id} className={`border-t ${rowClass(a.state)}`}>
                <td className="px-3 py-2 font-medium">{a.patient?.name}</td>
                <td className="px-3 py-2 text-gray-600">{a.patient?.user?.document}</td>
                <td className="px-3 py-2 text-gray-600">{a.patient?.telephone}</td>
                <td className="px-3 py-2 text-gray-600">{a.dentist_procedure?.dentist?.name}</td>
                <td className="px-3 py-2 text-gray-600">{a.dentist_procedure?.procedure?.name}</td>
                <td className="px-3 py-2 text-gray-600">{formatDate(a.day)}</td>
                <td className="px-3 py-2 text-gray-600">{a.hour}</td>
                <td className="px-3 py-2"><Badge state={a.state} /></td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    {(a.state === 'Activo' || a.state === 'Recordado') && (
                      <>
                        <button onClick={() => { setSelected(a); setPayModal(true); setPayments([{ price: '', procedure_id: '' }]); }}
                          className="p-1 bg-[#0369A1] text-white rounded text-xs hover:bg-[#6aa018]"><FileText size={13} /></button>
                        <button onClick={() => markWhatsapp(a)} title="WhatsApp"
                          className="p-1 bg-green-500 text-white rounded hover:bg-green-600"><MessageCircle size={13} /></button>
                        <button onClick={() => markPhone(a.id)} title="Llamada"
                          className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"><Phone size={13} /></button>
                        <button onClick={() => deleteAppt(a.id)}
                          className="p-1 bg-red-500 text-white rounded hover:bg-red-600"><Trash2 size={13} /></button>
                      </>
                    )}
                    {(a.state === 'Cancelado' || a.state === 'No asistio') && (
                      <button onClick={() => deleteAppt(a.id)} className="p-1 bg-red-500 text-white rounded hover:bg-red-600"><Trash2 size={13} /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">No hay citas para mostrar</td></tr>
            )}
          </tbody>
        </table>
        {meta && <div className="px-4"><Paginator meta={meta} onChange={(p) => { setPage(p); load(p); }} /></div>}
      </div>

      {/* Payment modal */}
      <Modal open={payModal} onClose={() => setPayModal(false)} title="Gestionar cita">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-sm bg-gray-50 rounded-lg p-3">
              <div><span className="font-medium">Paciente:</span> {selected.patient?.name}</div>
              <div><span className="font-medium">Procedimiento:</span> {selected.dentist_procedure?.procedure?.name}</div>
              <div><span className="font-medium">Fecha:</span> {formatDate(selected.day)}</div>
              <div><span className="font-medium">Hora:</span> {selected.hour}</div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Items de factura</label>
              {payments.map((pay, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <Input placeholder="Precio" type="number" value={pay.price}
                    onChange={(e) => { const n = [...payments]; n[i].price = e.target.value; setPayments(n); }} />
                  <Input placeholder="Procedimiento ID" type="number" value={pay.procedure_id}
                    onChange={(e) => { const n = [...payments]; n[i].procedure_id = e.target.value; setPayments(n); }} />
                  {i > 0 && <button onClick={() => setPayments(payments.filter((_, j) => j !== i))} className="text-red-500 text-xs">✕</button>}
                </div>
              ))}
              <button onClick={() => setPayments([...payments, { price: '', procedure_id: '' }])}
                className="text-[#0369A1] text-xs hover:underline">+ Agregar ítem</button>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => changeState('No asistio')} variant="danger" loading={saving}>No asistió</Button>
              <Button onClick={() => changeState('Asistio')} loading={saving}>Asistió / Pagar</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
