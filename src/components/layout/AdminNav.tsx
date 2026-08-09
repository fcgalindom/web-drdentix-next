'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Calendar, UserPlus, Search } from 'lucide-react';
import { clearSession, getUser } from '@/lib/auth';
import api from '@/lib/api';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { verifyDocSchema, patientSchema, extractErrors } from '@/lib/schemas';
import { useAsyncFormHandler } from '@/hooks/useAsyncFormHandler';
import { useAlert } from '@/hooks/useAlert';
import AlertGeneric from '@/components/web/AlertGeneric';
import ErrorMessage from '@/components/web/ErrorMessage';

export default function AdminNav() {
  const router = useRouter();
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null);
  useEffect(() => { setUser(getUser()); }, []);
  const [showCreate, setShowCreate] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [verifyDoc, setVerifyDoc] = useState('');
  const [form, setForm] = useState({ name: '', document: '', telephone: '', birth: '', city: '', email: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { execute, isLoading } = useAsyncFormHandler();
  const { alert, showAlert, hideAlert } = useAlert();

  async function logout() {
    await api.post('/auth/logout').catch(() => {});
    clearSession();
    router.replace('/login');
  }

  async function handleCreatePatient() {
    const r = patientSchema.safeParse(form);
    if (!r.success) { setErrors(extractErrors(r.error)); return; }
    setErrors({});
    const result = await execute(signal => api.post('/admin/patients', form, { signal }));
    if (result.response) {
      setShowCreate(false);
      router.push(`/admin/citas?patient_id=${result.response.data.id}`);
    }
  }

  async function handleVerify() {
    const r = verifyDocSchema.safeParse({ document: verifyDoc });
    if (!r.success) { setErrors(extractErrors(r.error)); return; }
    setErrors({});
    const result = await execute(signal => api.post('/admin/patients/find-by-document', { document: verifyDoc }, { signal }));
    if (result.response) {
      const data = result.response.data;
      if (data.status === 200) {
        setShowVerify(false);
        router.push(`/admin/citas?patient_id=${data.id}`);
      } else {
        showAlert('Paciente no encontrado. Crea uno primero.', 'warning');
        setShowVerify(false);
        setShowCreate(true);
      }
    }
  }

  return (
    <>
      <nav className="bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-[#0F172A] font-extrabold text-lg" style={{fontFamily:'Manrope,sans-serif'}}>Dr. Dentix</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => setShowVerify(true)}>
              <Search size={14} /> Verificar cita
            </Button>
            <Button size="sm" variant="outline" onClick={() => router.push('/admin/citas/nueva')}>
              <Calendar size={14} /> Agendar cita
            </Button>
            <Button size="sm" onClick={() => setShowCreate(true)}>
              <UserPlus size={14} /> Crear paciente
            </Button>
            <div className="w-px h-5 bg-slate-200 mx-1" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#0EA5E9] flex items-center justify-center text-white text-xs font-bold">
                {user?.type_user?.[0] ?? 'A'}
              </div>
              <span className="text-xs font-medium text-slate-600 hidden md:block">{user?.type_user}</span>
            </div>
            <button onClick={logout} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* Verificar cita modal */}
      <Modal open={showVerify} onClose={() => setShowVerify(false)} title="Verificar citas" size="sm">
        <div className="flex flex-col gap-4">
          <Input label="Número de cédula" value={verifyDoc} onChange={(e) => { setVerifyDoc(e.target.value); setErrors({}); }}
            onKeyDown={(e) => e.key === 'Enter' && handleVerify()} placeholder="Ej: 1234567890" />
          <ErrorMessage message={errors.document} />
          <Button onClick={handleVerify}>Verificar</Button>
        </div>
      </Modal>

      {/* Crear paciente modal */}
      <Modal open={showCreate} onClose={() => { setShowCreate(false); setErrors({}); }} title="Crear paciente" size="sm">
        <div className="grid grid-cols-1 gap-3">
          <Input label="Nombre completo *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <ErrorMessage message={errors.name} />
          <Input label="Documento *" value={form.document} onChange={(e) => setForm({ ...form, document: e.target.value })} />
          <ErrorMessage message={errors.document} />
          <Input label="Teléfono *" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
          <ErrorMessage message={errors.telephone} />
          <Input label="Fecha de nacimiento" type="date" value={form.birth} onChange={(e) => setForm({ ...form, birth: e.target.value })} />
          <Input label="Ciudad" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <Input label="Email (opcional)" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <ErrorMessage message={errors.email} />
          <Button onClick={handleCreatePatient} loading={isLoading}>Guardar</Button>
        </div>
      </Modal>
      <AlertGeneric severity={alert.severity} message={alert.message} open={alert.open} onClose={hideAlert} />
    </>
  );
}
