'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Calendar, UserPlus, Search } from 'lucide-react';
import { clearSession, getUser } from '@/lib/auth';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function AdminNav() {
  const router = useRouter();
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null);
  useEffect(() => { setUser(getUser()); }, []);
  const [showCreate, setShowCreate] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [verifyDoc, setVerifyDoc] = useState('');
  const [form, setForm] = useState({ name: '', document: '', telephone: '', birth: '', city: '', email: '' });
  const [loading, setLoading] = useState(false);

  async function logout() {
    await api.post('/auth/logout').catch(() => {});
    clearSession();
    router.replace('/login');
  }

  async function handleCreatePatient() {
    setLoading(true);
    try {
      const { data } = await api.post('/admin/patients', form);
      toast.success('Paciente creado');
      setShowCreate(false);
      router.push(`/admin/citas?patient_id=${data.id}`);
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Error al crear paciente');
    } finally { setLoading(false); }
  }

  async function handleVerify() {
    if (!verifyDoc) return;
    try {
      const { data } = await api.post('/admin/patients/find-by-document', { document: verifyDoc });
      if (data.status === 200) {
        setShowVerify(false);
        router.push(`/admin/citas?patient_id=${data.id}`);
      } else {
        toast('Paciente no encontrado. Crea uno primero.', { icon: '⚠️' });
        setShowVerify(false);
        setShowCreate(true);
      }
    } catch { toast.error('Error al verificar'); }
  }

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-[#013253] font-bold text-xl">Dr. Dentix</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button size="sm" onClick={() => setShowVerify(true)}>
              <Search size={14} /> Verificar cita
            </Button>
            <Button size="sm" onClick={() => router.push('/admin/citas/nueva')}>
              <Calendar size={14} /> Agendar cita
            </Button>
            <Button size="sm" onClick={() => setShowCreate(true)}>
              <UserPlus size={14} /> Crear paciente
            </Button>
            <div className="w-px h-6 bg-gray-200 mx-1" />
            <span className="text-sm text-gray-600 hidden md:block">{user?.type_user}</span>
            <button onClick={logout} className="p-2 text-gray-500 hover:text-red-600 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
        <div className="h-1.5 bg-[#013253]" />
      </nav>

      {/* Verificar cita modal */}
      <Modal open={showVerify} onClose={() => setShowVerify(false)} title="Verificar citas" size="sm">
        <div className="flex flex-col gap-4">
          <Input label="Número de cédula" value={verifyDoc} onChange={(e) => setVerifyDoc(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleVerify()} placeholder="Ej: 1234567890" />
          <Button onClick={handleVerify}>Verificar</Button>
        </div>
      </Modal>

      {/* Crear paciente modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Crear paciente" size="sm">
        <div className="grid grid-cols-1 gap-3">
          <Input label="Nombre completo *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Documento *" value={form.document} onChange={(e) => setForm({ ...form, document: e.target.value })} />
          <Input label="Teléfono *" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
          <Input label="Fecha de nacimiento" type="date" value={form.birth} onChange={(e) => setForm({ ...form, birth: e.target.value })} />
          <Input label="Ciudad" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <Input label="Email (opcional)" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Button onClick={handleCreatePatient} loading={loading}>Guardar</Button>
        </div>
      </Modal>
    </>
  );
}
