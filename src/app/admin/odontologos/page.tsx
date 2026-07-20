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
import { Plus, Pencil, CalendarDays, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Dentist { id: number; name: string; city: string; user: { document: string; email: string; state: string }; procedures: { id: number; name: string }[]; }
interface Procedure { id: number; name: string; duration: number; }

const empty = { id: 0, name: '', city: '', document: '', email: '', birth: '', password: '', procedure_ids: [] as number[] };

export default function OdontologosPage() {
  const { loading } = useAuth('Administrator');
  const router = useRouter();
  const [items, setItems] = useState<Dentist[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ name: '', document: '', city: '' });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(empty);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [saving, setSaving] = useState(false);

  async function load(p = 1) {
    const params = new URLSearchParams({ page: String(p), ...filters });
    const [dentists, procs] = await Promise.all([
      api.get(`/admin/dentists?${params}`),
      api.get('/staff/procedures/select'),
    ]);
    setItems(dentists.data.data);
    setMeta(dentists.data.meta);
    setProcedures(procs.data);
  }

  useEffect(() => { if (!loading) load(); }, [loading]);

  function addProcedure(id: number) {
    if (!form.procedure_ids.includes(id)) setForm((f: any) => ({ ...f, procedure_ids: [...f.procedure_ids, id] }));
  }
  function removeProcedure(id: number) {
    setForm((f: any) => ({ ...f, procedure_ids: f.procedure_ids.filter((x: number) => x !== id) }));
  }

  function openEdit(d: Dentist) {
    setForm({ id: d.id, name: d.name, city: d.city, document: d.user.document, email: d.user.email ?? '', birth: '', password: '', procedure_ids: d.procedures.map(p => p.id) });
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    try {
      await api.post('/admin/dentists', form);
      toast.success('Guardado'); setOpen(false); load(page);
    } catch (e: any) { toast.error(e.response?.data?.message ?? 'Error'); }
    finally { setSaving(false); }
  }

  async function toggleState(d: Dentist) {
    await api.post('/admin/dentists/state', { id: d.id, state: d.user.state === 'Activo' ? 'Inactivo' : 'Activo' });
    load(page);
  }

  if (loading) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#013253]">Odontólogos</h1>
        <Button onClick={() => { setForm(empty); setOpen(true); }}><Plus size={16} /> Crear</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-end">
        <Input label="Nombre" value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
        <Input label="Cédula" value={filters.document} onChange={(e) => setFilters({ ...filters, document: e.target.value })} />
        <Input label="Ciudad" value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })} />
        <Button onClick={() => { setPage(1); load(1); }}>Buscar</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#00AFF1] text-white">
            <tr>{['Nombre', 'Cédula', 'Email', 'Ciudad', 'Procedimientos', 'Estado', 'Acciones'].map(h => (
              <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {items.map((d) => (
              <tr key={d.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{d.name}</td>
                <td className="px-4 py-3 text-gray-600">{d.user?.document}</td>
                <td className="px-4 py-3 text-gray-600">{d.user?.email ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{d.city}</td>
                <td className="px-4 py-3 text-gray-600">{d.procedures?.length ?? 0}</td>
                <td className="px-4 py-3"><Toggle active={d.user?.state === 'Activo'} onToggle={() => toggleState(d)} /></td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => openEdit(d)} className="p-1.5 text-[#013253] hover:bg-blue-50 rounded"><Pencil size={15} /></button>
                  <button onClick={() => router.push(`/admin/odontologos/${d.id}/horario`)} className="p-1.5 text-[#7CB91D] hover:bg-green-50 rounded"><CalendarDays size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {meta && <div className="px-4"><Paginator meta={meta} onChange={(p) => { setPage(p); load(p); }} /></div>}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={form.id ? 'Editar odontólogo' : 'Nuevo odontólogo'} size="xl">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Nombre *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Ciudad *" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <Input label="Cédula *" value={form.document} onChange={(e) => setForm({ ...form, document: e.target.value })} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Fecha de nacimiento" type="date" value={form.birth} onChange={(e) => setForm({ ...form, birth: e.target.value })} />
          {!form.id && <Input label="Contraseña *" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />}
          <div className="col-span-2">
            <label className="text-sm font-medium text-gray-700 block mb-1">Procedimientos</label>
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" onChange={(e) => addProcedure(Number(e.target.value))}>
              <option value="">Seleccionar procedimiento</option>
              {procedures.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <div className="flex flex-wrap gap-2 mt-2">
              {form.procedure_ids.map((id: number) => {
                const p = procedures.find(x => x.id === id);
                return p ? (
                  <span key={id} className="flex items-center gap-1 bg-[#e1fea4] text-[#013253] text-xs px-2 py-1 rounded-full">
                    {p.name}
                    <button onClick={() => removeProcedure(id)}><X size={12} /></button>
                  </span>
                ) : null;
              })}
            </div>
          </div>
          <div className="col-span-2"><Button onClick={save} loading={saving} className="w-full justify-center">Guardar</Button></div>
        </div>
      </Modal>
    </div>
  );
}
