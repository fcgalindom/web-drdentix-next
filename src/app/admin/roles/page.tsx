'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Paginator from '@/components/ui/Paginator';
import toast from 'react-hot-toast';
import { Plus, Pencil, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Role { id: number; name: string; guard_name: string; permissions_count?: number; }

export default function RolesPage() {
  const { loading } = useAuth('Administrator');
  const router = useRouter();
  const [items, setItems] = useState<Role[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ id: 0, name: '' });
  const [saving, setSaving] = useState(false);

  async function load(p = 1) {
    try {
      const { data } = await api.get(`/roles?page=${p}`);
      setItems(data.data);
      setMeta(data.meta);
    } catch { toast.error('Error al cargar roles'); }
  }

  useEffect(() => { if (!loading) load(); }, [loading]);

  async function save() {
    setSaving(true);
    try {
      const { id, name } = form;
      if (id) {
        await api.put(`/roles/${id}`, { name });
      } else {
        await api.post('/roles', { name, guard_name: 'web' });
      }
      toast.success(id ? 'Rol actualizado' : 'Rol creado');
      setOpen(false);
      load(page);
    } catch (e: any) { toast.error(e.response?.data?.message ?? 'Error'); }
    finally { setSaving(false); }
  }

  async function remove(id: number, name: string) {
    if (!confirm(`¿Eliminar el rol "${name}"?`)) return;
    try {
      await api.delete(`/roles/${id}`);
      toast.success('Rol eliminado');
      load(page);
    } catch { toast.error('Error al eliminar'); }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><span className="text-gray-400">Cargando...</span></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#013253]">Roles</h1>
        <Button onClick={() => { setForm({ id: 0, name: '' }); setOpen(true); }}><Plus size={16} /> Crear</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#00AFF1] text-white">
            <tr>{['Nombre', 'Permisos', 'Acciones'].map(h => (
              <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{r.name}</td>
                <td className="px-4 py-3 text-gray-600">{r.permissions_count ?? '—'}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => router.push(`/admin/roles/${r.id}`)}
                    className="p-1.5 text-[#7CB91D] hover:bg-green-50 rounded" title="Asignar permisos">
                    <Shield size={15} />
                  </button>
                  <button onClick={() => { setForm({ id: r.id, name: r.name }); setOpen(true); }}
                    className="p-1.5 text-[#013253] hover:bg-blue-50 rounded"><Pencil size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {meta && <div className="px-4"><Paginator meta={meta} onChange={(p) => { setPage(p); load(p); }} /></div>}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={form.id ? 'Editar rol' : 'Nuevo rol'} size="sm">
        <div className="grid gap-3">
          <Input label="Nombre del rol *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Button onClick={save} loading={saving}>Guardar</Button>
        </div>
      </Modal>
    </div>
  );
}
