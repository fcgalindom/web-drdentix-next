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
import { Plus, Pencil, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Patient { id: number; name: string; city: string; telephone: string; user: { document: string; email: string; state: string }; }

const empty = { id: 0, name: '', document: '', telephone: '', birth: '', city: '', email: '' };

export default function PacientesPage() {
  const { loading } = useAuth('Administrator');
  const router = useRouter();
  const [items, setItems] = useState<Patient[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ name: '', document: '', city: '' });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  async function load(p = 1) {
    const params = new URLSearchParams({ page: String(p), ...filters });
    try {
      const { data } = await api.get(`/admin/patients?${params}`);
      setItems(data.data);
      setMeta(data.meta);
    } catch { toast.error('Error al cargar pacientes'); }
  }

  useEffect(() => { if (!loading) load(page); }, [loading]);

  function openEdit(p: Patient) {
    setForm({ id: p.id, name: p.name, document: p.user.document, telephone: p.telephone, birth: '', city: p.city ?? '', email: p.user.email ?? '' });
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    try {
      const { data } = await api.post('/admin/patients', form);
      toast.success(form.id ? 'Paciente actualizado' : 'Paciente creado');
      setOpen(false);
      if (!form.id) router.push(`/admin/citas?patient_id=${data.id}`);
      else load(page);
    } catch (e: any) { toast.error(e.response?.data?.message ?? 'Error'); }
    finally { setSaving(false); }
  }

  async function toggleState(p: Patient) {
    try {
      await api.post('/admin/patients/deactivate', { id: p.id, state: p.user.state === 'Activo' ? 'Inactivo' : 'Activo' });
      load(page);
    } catch { toast.error('Error'); }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><span className="text-gray-400">Cargando...</span></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#013253]">Pacientes</h1>
        <Button onClick={() => { setForm(empty); setOpen(true); }}><Plus size={16} /> Crear</Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-end">
        <Input label="Nombre" value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
        <Input label="Cédula" value={filters.document} onChange={(e) => setFilters({ ...filters, document: e.target.value })} />
        <Input label="Ciudad" value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })} />
        <Button onClick={() => { setPage(1); load(1); }}>Buscar</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#00AFF1] text-white">
            <tr>{['Nombre', 'Cédula', 'Email', 'Ciudad', 'Teléfono', 'Estado', 'Acciones'].map(h => (
              <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-gray-600">{p.user?.document}</td>
                <td className="px-4 py-3 text-gray-600">{p.user?.email ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{p.city ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{p.telephone}</td>
                <td className="px-4 py-3"><Toggle active={p.user?.state === 'Activo'} onToggle={() => toggleState(p)} /></td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => openEdit(p)} className="p-1.5 text-[#013253] hover:bg-blue-50 rounded"><Pencil size={15} /></button>
                  <button onClick={() => router.push(`/admin/citas?patient_id=${p.id}`)} className="p-1.5 text-[#7CB91D] hover:bg-green-50 rounded"><Eye size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {meta && <div className="px-4"><Paginator meta={meta} onChange={(p) => { setPage(p); load(p); }} /></div>}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={form.id ? 'Editar paciente' : 'Nuevo paciente'} size="sm">
        <div className="grid gap-3">
          <Input label="Nombre *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Documento *" value={form.document} onChange={(e) => setForm({ ...form, document: e.target.value })} />
          <Input label="Teléfono *" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
          <Input label="Fecha de nacimiento" type="date" value={form.birth} onChange={(e) => setForm({ ...form, birth: e.target.value })} />
          <Input label="Ciudad" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <Input label="Email (opcional)" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Button onClick={save} loading={saving}>Guardar</Button>
        </div>
      </Modal>
    </div>
  );
}
