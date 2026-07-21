'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Paginator from '@/components/ui/Paginator';
import Toggle from '@/components/ui/Toggle';
import toast from 'react-hot-toast';
import { Plus, Pencil } from 'lucide-react';

interface Promo { id: number; date_start: string; date_end: string; details: string; discount: number; limit_patients: number; status: number; }

const empty = { id: 0, date_start: '', date_end: '', details: '', discount: '', limit_patients: '' };

export default function PromocionesPage() {
  const { loading } = useAuth('Administrator');
  const [items, setItems] = useState<Promo[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(empty);
  const [saving, setSaving] = useState(false);

  async function load(p = 1) {
    const { data } = await api.get(`/admin/promotions?page=${p}`);
    setItems(data.data); setMeta(data.meta);
  }

  useEffect(() => { if (!loading) load(); }, [loading]);

  async function save() {
    setSaving(true);
    try {
      const { id, ...rest } = form;
      const payload: any = { ...rest, discount: Number(form.discount), limit_patients: Number(form.limit_patients) };
      if (id) payload.id = id;
      await api.post('/admin/promotions', payload);
      toast.success('Guardado'); setOpen(false); load(page);
    } catch (e: any) { toast.error(e.response?.data?.message ?? 'Error'); }
    finally { setSaving(false); }
  }

  async function deactivate(p: Promo) {
    await api.post('/admin/promotions/deactivate', { id: p.id });
    load(page);
  }

  if (loading) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#013253]">Promociones</h1>
        <Button onClick={() => { setForm(empty); setOpen(true); }}><Plus size={16} /> Crear</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#00AFF1] text-white">
            <tr>{['Fecha inicio', 'Fecha fin', 'Detalle', 'Descuento', 'Límite', 'Estado', ''].map(h => (
              <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{p.date_start}</td>
                <td className="px-4 py-3">{p.date_end}</td>
                <td className="px-4 py-3 max-w-xs truncate">{p.details}</td>
                <td className="px-4 py-3">{p.discount}%</td>
                <td className="px-4 py-3">{p.limit_patients}</td>
                <td className="px-4 py-3"><Toggle active={p.status === 1} onToggle={() => deactivate(p)} /></td>
                <td className="px-4 py-3">
                  <button onClick={() => { setForm({ id: p.id, date_start: p.date_start, date_end: p.date_end, details: p.details, discount: String(p.discount), limit_patients: String(p.limit_patients) }); setOpen(true); }}
                    className="p-1.5 text-[#013253] hover:bg-blue-50 rounded"><Pencil size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {meta && <div className="px-4"><Paginator meta={meta} onChange={(p) => { setPage(p); load(p); }} /></div>}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={form.id ? 'Editar promoción' : 'Nueva promoción'}>
        <div className="grid gap-3">
          <Input label="Fecha inicio *" type="date" value={form.date_start} onChange={(e) => setForm({ ...form, date_start: e.target.value })} />
          <Input label="Fecha fin *" type="date" value={form.date_end} onChange={(e) => setForm({ ...form, date_end: e.target.value })} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Detalles *</label>
            <textarea rows={4} value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-[#00AFF1] outline-none resize-none" />
          </div>
          <Input label="Descuento (%)" type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} />
          <Input label="Límite de pacientes" type="number" value={form.limit_patients} onChange={(e) => setForm({ ...form, limit_patients: e.target.value })} />
          <Button onClick={save} loading={saving}>Guardar</Button>
        </div>
      </Modal>
    </div>
  );
}
