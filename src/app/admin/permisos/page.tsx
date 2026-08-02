'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface Permission { id: number; name: string; guard_name: string; }

export default function PermisosPage() {
  const { loading } = useAuth('Administrator');
  const [items, setItems] = useState<Permission[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ id: 0, name: '' });
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const { data } = await api.get('/permissions');
      setItems(data);
    } catch { toast.error('Error al cargar permisos'); }
  }

  useEffect(() => { if (!loading) load(); }, [loading]);

  async function save() {
    setSaving(true);
    try {
      const { id, name } = form;
      if (id) {
        await api.put(`/permissions/${id}`, { name });
      } else {
        await api.post('/permissions', { name, guard_name: 'web' });
      }
      toast.success(id ? 'Permiso actualizado' : 'Permiso creado');
      setOpen(false);
      load();
    } catch (e: any) { toast.error(e.response?.data?.message ?? 'Error'); }
    finally { setSaving(false); }
  }

  if (loading) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#013253]">Permisos</h1>
        <Button onClick={() => { setForm({ id: 0, name: '' }); setOpen(true); }}><Plus size={16} /> Crear</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#00AFF1] text-white">
            <tr>{['Nombre', 'Acciones'].map(h => (
              <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium font-mono text-xs">{p.name}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => { setForm({ id: p.id, name: p.name }); setOpen(true); }}
                    className="p-1.5 text-[#013253] hover:bg-blue-50 rounded"><Pencil size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={form.id ? 'Editar permiso' : 'Nuevo permiso'} size="sm">
        <div className="grid gap-3">
          <Input label="Nombre del permiso *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ej: citas.crear" />
          <Button onClick={save} loading={saving}>Guardar</Button>
        </div>
      </Modal>
    </div>
  );
}
