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

interface Procedure { id: number; name: string; duration: number; state: string; }

export default function ProcedimientosPage() {
  const { loading } = useAuth('Administrator');
  const [items, setItems] = useState<Procedure[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ id: 0, name: '', duration: '' });
  const [saving, setSaving] = useState(false);

  async function load(p = 1) {
    const { data } = await api.get(`/admin/procedures?page=${p}`);
    setItems(data.data); setMeta(data.meta);
  }

  useEffect(() => { if (!loading) load(); }, [loading]);

  async function save() {
    setSaving(true);
    try {
      await api.post('/admin/procedures', { ...form, duration: Number(form.duration) });
      toast.success('Guardado'); setOpen(false); load(page);
    } catch (e: any) { toast.error(e.response?.data?.message ?? 'Error'); }
    finally { setSaving(false); }
  }

  async function toggleState(p: Procedure) {
    await api.post('/admin/procedures/state', { id: p.id, state: p.state === 'Activo' ? 'Inactivo' : 'Activo' });
    load(page);
  }

  if (loading) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#013253]">Procedimientos</h1>
        <Button onClick={() => { setForm({ id: 0, name: '', duration: '' }); setOpen(true); }}><Plus size={16} /> Crear</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#00AFF1] text-white">
            <tr>{['Nombre', 'Duración', 'Estado', ''].map(h => <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-gray-600">{p.duration} minutos</td>
                <td className="px-4 py-3"><Toggle active={p.state === 'Activo'} onToggle={() => toggleState(p)} /></td>
                <td className="px-4 py-3">
                  <button onClick={() => { setForm({ id: p.id, name: p.name, duration: String(p.duration) }); setOpen(true); }}
                    className="p-1.5 text-[#013253] hover:bg-blue-50 rounded"><Pencil size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {meta && <div className="px-4"><Paginator meta={meta} onChange={(p) => { setPage(p); load(p); }} /></div>}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={form.id ? 'Editar procedimiento' : 'Nuevo procedimiento'} size="sm">
        <div className="grid gap-3">
          <Input label="Nombre *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Duración (minutos) *" type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
          <Button onClick={save} loading={saving}>Guardar</Button>
        </div>
      </Modal>
    </div>
  );
}
