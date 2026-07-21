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
import { Plus, Pencil, Eye, Download, Users, Calendar, Activity, SlidersHorizontal, MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Patient { id: number; name: string; city: string; telephone: string; user: { document: string; email: string; state: string }; }

const empty = { id: 0, name: '', document: '', telephone: '', birth: '', city: '', email: '' };

const AVATAR_COLORS = ['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-orange-500', 'bg-pink-500', 'bg-cyan-500'];

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

function getAvatarColor(id: number) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

function Statebadge({ state }: { state: string }) {
  const styles: Record<string, string> = {
    Activo: 'bg-green-100 text-green-700',
    Inactivo: 'bg-gray-100 text-gray-500',
    Pendiente: 'bg-yellow-100 text-yellow-700',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[state] ?? 'bg-gray-100 text-gray-500'}`}>
      {state}
    </span>
  );
}

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
      const { id, ...rest } = form;
      const payload: any = { ...rest };
      if (id) payload.id = id;
      const { data } = await api.post('/admin/patients', payload);
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

  const total = meta?.total ?? items.length;
  const activos = items.filter(p => p.user?.state === 'Activo').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A]">Gestión de Pacientes Dental</h1>
          <p className="text-gray-500 mt-1 text-sm">Administre el historial clínico y el estado de sus pacientes con precisión.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Exportar
          </button>
          <button
            onClick={() => { setForm(empty); setOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#0F172A] text-white rounded-lg text-sm font-medium hover:bg-[#012040] transition-colors"
          >
            <Plus size={15} /> Añadir Paciente
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-50 rounded-lg"><Users size={18} className="text-blue-500" /></div>
            <span className="text-xs font-semibold text-green-500">+12%</span>
          </div>
          <p className="text-xs text-gray-500 mb-1">Total de Pacientes</p>
          <p className="text-2xl font-bold text-[#0F172A]">{total.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-cyan-50 rounded-lg"><Calendar size={18} className="text-cyan-500" /></div>
            <span className="text-xs font-semibold text-green-500">+4%</span>
          </div>
          <p className="text-xs text-gray-500 mb-1">Activos este mes</p>
          <p className="text-2xl font-bold text-[#0F172A]">{activos}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-indigo-50 rounded-lg"><Activity size={18} className="text-indigo-500" /></div>
            <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Estable</span>
          </div>
          <p className="text-xs text-gray-500 mb-1">Tratamientos Activos</p>
          <p className="text-2xl font-bold text-[#0F172A]">—</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap gap-3 items-end">
        <Input label="Nombre" value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
        <Input label="Cédula" value={filters.document} onChange={(e) => setFilters({ ...filters, document: e.target.value })} />
        <Input label="Ciudad" value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })} />
        <Button onClick={() => { setPage(1); load(1); }}>Buscar</Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-[#0F172A]">Perfiles Médicos</h2>
          <div className="flex items-center gap-2 text-gray-400">
            <button className="p-1.5 hover:bg-gray-100 rounded-lg"><SlidersHorizontal size={16} /></button>
            <button className="p-1.5 hover:bg-gray-100 rounded-lg"><MoreVertical size={16} /></button>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {['PACIENTE', 'ID DE REGISTRO', 'CONTACTO', 'ESTADO', 'CIUDAD', 'ACCIONES'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${getAvatarColor(p.id)}`}>
                      {getInitials(p.name)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.user?.email ?? '—'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-gray-500 font-mono text-xs">#DP-{String(p.id).padStart(3, '0')}</td>
                <td className="px-5 py-3 text-gray-600">{p.telephone}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Statebadge state={p.user?.state} />
                    <Toggle active={p.user?.state === 'Activo'} onToggle={() => toggleState(p)} />
                  </div>
                </td>
                <td className="px-5 py-3 text-gray-500">{p.city ?? '—'}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-[#0F172A] hover:bg-blue-50 rounded-lg transition-colors"><Pencil size={14} /></button>
                    <button onClick={() => router.push(`/admin/citas?patient_id=${p.id}`)} className="p-1.5 text-gray-400 hover:text-[#0EA5E9] hover:bg-cyan-50 rounded-lg transition-colors"><Eye size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            Mostrando {items.length} de {total.toLocaleString()} pacientes
          </span>
          {meta && <Paginator meta={meta} onChange={(p) => { setPage(p); load(p); }} />}
        </div>
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
