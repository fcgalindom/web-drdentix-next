'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Paginator from '@/components/ui/Paginator';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Product { id: number; active_principle: string; concentration: string; amount: number; pharmaceutical_form: string; commercial_presentation: string; medication_unit: string; batch: string; health_register_invima: string; expiration_date: string; semaphore: string; date_of_admission: string; }

const empty = { id: 0, active_principle: '', concentration: '', amount: '', pharmaceutical_form: '', commercial_presentation: '', medication_unit: '', batch: '', health_register_invima: '', expiration_date: '', date_of_admission: '' };

export default function ProductosPage() {
  const { loading } = useAuth('Administrator');
  const [items, setItems] = useState<Product[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(empty);
  const [saving, setSaving] = useState(false);

  async function load(p = 1) {
    const { data } = await api.get(`/admin/products?page=${p}`);
    setItems(data.data); setMeta(data.meta);
  }

  useEffect(() => { if (!loading) load(); }, [loading]);

  function f(key: string, val: string) { setForm((prev: any) => ({ ...prev, [key]: val })); }

  async function save() {
    setSaving(true);
    try {
      await api.post('/admin/products', { ...form, amount: Number(form.amount) });
      toast.success('Guardado'); setOpen(false); load(page);
    } catch (e: any) { toast.error(e.response?.data?.message ?? 'Error'); }
    finally { setSaving(false); }
  }

  async function remove(id: number) {
    if (!confirm('¿Eliminar producto?')) return;
    await api.delete(`/admin/products/${id}`);
    toast.success('Eliminado'); load(page);
  }

  const semColors: Record<string, string> = { verde: 'semaforo-verde', amarillo: 'semaforo-amarillo', rojo: 'semaforo-rojo' };

  if (loading) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#013253]">Inventario médico</h1>
        <Button onClick={() => { setForm(empty); setOpen(true); }}><Plus size={16} /> Crear</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm whitespace-nowrap">
          <thead className="bg-[#00AFF1] text-white">
            <tr>{['N°', 'Principio activo', 'Concentración', 'Cant.', 'Forma farmacéutica', 'Presentación', 'Semáforo', 'Vencimiento', 'Ingreso', ''].map(h => (
              <th key={h} className="px-3 py-3 text-left font-semibold">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {items.map((p, i) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2 text-gray-500">{i + 1}</td>
                <td className="px-3 py-2 font-medium">{p.active_principle}</td>
                <td className="px-3 py-2 text-gray-600">{p.concentration}</td>
                <td className="px-3 py-2 text-gray-600">{p.amount}</td>
                <td className="px-3 py-2 text-gray-600">{p.pharmaceutical_form}</td>
                <td className="px-3 py-2 text-gray-600">{p.commercial_presentation}</td>
                <td className="px-3 py-2">
                  <span className={cn('px-2 py-0.5 rounded text-xs font-medium', semColors[p.semaphore] ?? '')}>{p.semaphore}</span>
                </td>
                <td className="px-3 py-2 text-gray-600">{p.expiration_date}</td>
                <td className="px-3 py-2 text-gray-600">{p.date_of_admission}</td>
                <td className="px-3 py-2 flex gap-1">
                  <button onClick={() => { setForm({ ...p, amount: String(p.amount) }); setOpen(true); }} className="p-1.5 text-[#013253] hover:bg-blue-50 rounded"><Pencil size={14} /></button>
                  <button onClick={() => remove(p.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {meta && <div className="px-4"><Paginator meta={meta} onChange={(p) => { setPage(p); load(p); }} /></div>}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={form.id ? 'Editar producto' : 'Nuevo producto'} size="xl">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Principio activo *" value={form.active_principle} onChange={(e) => f('active_principle', e.target.value)} />
          <Input label="Concentración *" value={form.concentration} onChange={(e) => f('concentration', e.target.value)} />
          <Input label="Cantidad *" type="number" value={form.amount} onChange={(e) => f('amount', e.target.value)} />
          <Input label="Forma farmacéutica *" value={form.pharmaceutical_form} onChange={(e) => f('pharmaceutical_form', e.target.value)} />
          <Input label="Presentación comercial *" value={form.commercial_presentation} onChange={(e) => f('commercial_presentation', e.target.value)} />
          <Input label="Unidad de medida *" value={form.medication_unit} onChange={(e) => f('medication_unit', e.target.value)} />
          <Input label="Lote/serie *" value={form.batch} onChange={(e) => f('batch', e.target.value)} />
          <Input label="Reg. sanitario INVIMA *" value={form.health_register_invima} onChange={(e) => f('health_register_invima', e.target.value)} />
          <Input label="Fecha de vencimiento *" type="date" value={form.expiration_date} onChange={(e) => f('expiration_date', e.target.value)} />
          <Input label="Fecha de ingreso *" type="date" value={form.date_of_admission} onChange={(e) => f('date_of_admission', e.target.value)} />
          <div className="col-span-2"><Button onClick={save} loading={saving} className="w-full justify-center">Guardar</Button></div>
        </div>
      </Modal>
    </div>
  );
}
