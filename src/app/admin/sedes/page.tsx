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

interface Branch { id: number; name: string; address: string; contact: string; city: string; state: string; }

const empty = { id: 0, name: '', address: '', contact: '', city: '', state: 'Activo' };

export default function SedesPage() {
  const { loading } = useAuth('Administrator');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  async function load(p = 1) {
    try {
      const { data } = await api.get(`/admin/branches?page=${p}`);
      setBranches(data.data);
      setMeta(data.meta);
    } catch { toast.error('Error al cargar sedes'); }
  }

  useEffect(() => { if (!loading) load(page); }, [loading, page]);

  function openCreate() { setForm(empty); setOpen(true); }
  function openEdit(b: Branch) { setForm(b); setOpen(true); }

  async function save() {
    setSaving(true);
    try {
      await api.post('/admin/branches', form);
      toast.success(form.id ? 'Sede actualizada' : 'Sede creada');
      setOpen(false);
      load(page);
    } catch (e: any) { toast.error(e.response?.data?.message ?? 'Error'); }
    finally { setSaving(false); }
  }

  async function toggleState(b: Branch) {
    try {
      await api.post('/admin/branches/state', { id: b.id, state: b.state === 'Activo' ? 'Inactivo' : 'Activo' });
      load(page);
    } catch { toast.error('Error'); }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><span className="text-gray-400">Cargando...</span></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#013253]">Sedes</h1>
        <Button onClick={openCreate}><Plus size={16} /> Crear</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#00AFF1] text-white">
            <tr>
              {['Nombre', 'Dirección', 'Contacto', 'Ciudad', 'Estado', 'Acciones'].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {branches.map((b) => (
              <tr key={b.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{b.name}</td>
                <td className="px-4 py-3 text-gray-600">{b.address}</td>
                <td className="px-4 py-3 text-gray-600">{b.contact}</td>
                <td className="px-4 py-3 text-gray-600">{b.city}</td>
                <td className="px-4 py-3">
                  <Toggle active={b.state === 'Activo'} onToggle={() => toggleState(b)} />
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => openEdit(b)} className="p-1.5 text-[#013253] hover:bg-blue-50 rounded"><Pencil size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {meta && <div className="px-4"><Paginator meta={meta} onChange={(p) => { setPage(p); load(p); }} /></div>}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={form.id ? 'Editar sede' : 'Nueva sede'} size="sm">
        <div className="grid gap-3">
          <Input label="Nombre *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Dirección *" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <Input label="Contacto *" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
          <Input label="Ciudad *" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <Button onClick={save} loading={saving}>Guardar</Button>
        </div>
      </Modal>
    </div>
  );
}
