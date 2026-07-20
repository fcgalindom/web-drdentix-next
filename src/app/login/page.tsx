'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { setSession } from '@/lib/auth';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'staff' | 'patient'>('patient');
  const [doc, setDoc] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [regForm, setRegForm] = useState({ name: '', document: '', telephone: '', birth: '', city: '', email: '' });

  async function loginPatient() {
    if (!doc) return toast.error('Ingresa tu cédula');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login/patient', { document: doc });
      setSession(data.token, data.user);
      router.replace('/patient/citas');
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Credenciales inválidas');
    } finally { setLoading(false); }
  }

  async function loginStaff() {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login/staff', { email, password });
      setSession(data.token, data.user);
      router.replace(data.user.type_user === 'Dentist' ? '/dentist/citas' : '/admin/citas');
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Credenciales inválidas');
    } finally { setLoading(false); }
  }

  async function register() {
    setLoading(true);
    try {
      await api.post('/admin/patients', regForm);
      toast.success('Cuenta creada. Ahora ingresa con tu cédula.');
      setShowRegister(false);
      setTab('patient');
      setDoc(regForm.document);
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Error al registrarse');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-[#013253] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-[#013253]">Dr. Dentix</h1>
          <p className="text-sm text-gray-500 mt-1">Clínica dental</p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-lg overflow-hidden border border-gray-200 mb-6">
          <button onClick={() => setTab('patient')}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${tab === 'patient' ? 'bg-[#7CB91D] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
            Paciente
          </button>
          <button onClick={() => setTab('staff')}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${tab === 'staff' ? 'bg-[#013253] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
            Staff
          </button>
        </div>

        {tab === 'patient' ? (
          <div className="flex flex-col gap-4">
            <Input label="Número de cédula" value={doc} onChange={(e) => setDoc(e.target.value)}
              placeholder="Ej: 1234567890" onKeyDown={(e) => e.key === 'Enter' && loginPatient()} />
            <Button onClick={loginPatient} loading={loading} className="w-full justify-center">
              Iniciar sesión
            </Button>
            <button onClick={() => setShowRegister(true)} className="text-sm text-[#013253] hover:underline text-center">
              ¿No tienes cuenta? Regístrate
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <Input label="Correo electrónico" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input label="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loginStaff()} />
            <Button onClick={loginStaff} loading={loading} variant="outline" className="w-full justify-center">
              Iniciar sesión
            </Button>
          </div>
        )}
      </div>

      {/* Register modal */}
      {showRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowRegister(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="font-semibold text-[#013253] mb-4">Crea tu cuenta</h3>
            <div className="flex flex-col gap-3">
              <Input label="Nombres y apellidos *" value={regForm.name} onChange={(e) => setRegForm({ ...regForm, name: e.target.value })} />
              <Input label="Documento *" value={regForm.document} onChange={(e) => setRegForm({ ...regForm, document: e.target.value })} />
              <Input label="Teléfono *" value={regForm.telephone} onChange={(e) => setRegForm({ ...regForm, telephone: e.target.value })} />
              <Input label="Fecha de nacimiento" type="date" value={regForm.birth} onChange={(e) => setRegForm({ ...regForm, birth: e.target.value })} />
              <Input label="Ciudad" value={regForm.city} onChange={(e) => setRegForm({ ...regForm, city: e.target.value })} />
              <Input label="Email (opcional)" type="email" placeholder="Puede ser Hotmail o Gmail" value={regForm.email} onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} />
              <Button onClick={register} loading={loading} className="w-full justify-center">Crear cuenta</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
