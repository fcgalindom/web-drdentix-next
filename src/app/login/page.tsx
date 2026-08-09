'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { setSession } from '@/lib/auth';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { loginStaffSchema, loginPatientSchema, patientSchema, extractErrors } from '@/lib/schemas';
import { useAsyncFormHandler } from '@/hooks/useAsyncFormHandler';
import { useAlert } from '@/hooks/useAlert';
import AlertGeneric from '@/components/web/AlertGeneric';
import ErrorMessage from '@/components/web/ErrorMessage';

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'staff' | 'patient'>('patient');
  const [doc, setDoc] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [regForm, setRegForm] = useState({ name: '', document: '', telephone: '', birth: '', city: '', email: '' });

  const { execute, isLoading } = useAsyncFormHandler();
  const { alert, showAlert, hideAlert } = useAlert();

  async function loginPatient() {
    const r = loginPatientSchema.safeParse({ document: doc });
    if (!r.success) { setErrors(extractErrors(r.error)); return; }
    setErrors({});
    const result = await execute(signal => api.post('/auth/login/patient', { document: doc }, { signal }));
    if (result.response) {
      setSession(result.response.data.token, result.response.data.user);
      router.replace('/patient/citas');
    }
  }

  async function loginStaff() {
    const r = loginStaffSchema.safeParse({ email, password });
    if (!r.success) { setErrors(extractErrors(r.error)); return; }
    setErrors({});
    const result = await execute(signal => api.post('/auth/login', { email, password }, { signal }));
    if (result.response) {
      setSession(result.response.data.token, result.response.data.user);
      router.replace(result.response.data.user.type_user === 'Dentist' ? '/dentist/citas' : '/admin/citas');
    }
  }

  async function register() {
    const r = patientSchema.safeParse(regForm);
    if (!r.success) { setErrors(extractErrors(r.error)); return; }
    setErrors({});
    const result = await execute(signal => api.post('/admin/patients', regForm, { signal }));
    if (result.response) {
      setShowRegister(false);
      setTab('patient');
      setDoc(regForm.document);
    }
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
          <button onClick={() => { setTab('patient'); setErrors({}); }}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${tab === 'patient' ? 'bg-[#7CB91D] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
            Paciente
          </button>
          <button onClick={() => { setTab('staff'); setErrors({}); }}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${tab === 'staff' ? 'bg-[#013253] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
            Staff
          </button>
        </div>

        {tab === 'patient' ? (
          <div className="flex flex-col gap-4">
            <Input label="Número de cédula" value={doc} onChange={(e) => { setDoc(e.target.value); setErrors({}); }}
              placeholder="Ej: 1234567890" onKeyDown={(e) => e.key === 'Enter' && loginPatient()} />
            <ErrorMessage message={errors.document} />
            <Button onClick={loginPatient} loading={isLoading} className="w-full justify-center">
              Iniciar sesión
            </Button>
            <button onClick={() => setShowRegister(true)} className="text-sm text-[#013253] hover:underline text-center">
              ¿No tienes cuenta? Regístrate
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <Input label="Correo electrónico" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrors({}); }} />
            <ErrorMessage message={errors.email} />
            <Input label="Contraseña" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => { setPassword(e.target.value); setErrors({}); }}
              onKeyDown={(e) => e.key === 'Enter' && loginStaff()}
              suffix={
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="p-0.5">
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              }
            />
            <ErrorMessage message={errors.password} />
            <Button onClick={loginStaff} loading={isLoading} variant="outline" className="w-full justify-center">
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
              <ErrorMessage message={errors.name} />
              <Input label="Documento *" value={regForm.document} onChange={(e) => setRegForm({ ...regForm, document: e.target.value })} />
              <ErrorMessage message={errors.document} />
              <Input label="Teléfono *" value={regForm.telephone} onChange={(e) => setRegForm({ ...regForm, telephone: e.target.value })} />
              <ErrorMessage message={errors.telephone} />
              <Input label="Fecha de nacimiento" type="date" value={regForm.birth} onChange={(e) => setRegForm({ ...regForm, birth: e.target.value })} />
              <Input label="Ciudad" value={regForm.city} onChange={(e) => setRegForm({ ...regForm, city: e.target.value })} />
              <Input label="Email (opcional)" type="email" placeholder="Puede ser Hotmail o Gmail" value={regForm.email} onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} />
              <ErrorMessage message={errors.email} />
              <Button onClick={register} loading={isLoading} className="w-full justify-center">Crear cuenta</Button>
            </div>
          </div>
        </div>
      )}
      <AlertGeneric severity={alert.severity} message={alert.message} open={alert.open} onClose={hideAlert} />
    </div>
  );
}
