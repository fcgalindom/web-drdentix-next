'use client';
import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import { authService } from '@/services';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';
import { Camera } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function PatientPerfilPage() {
  const { user, loading } = useAuth('Patient');
  const [patient, setPatient] = useState<any>(null);
  const [photoModal, setPhotoModal] = useState(false);
  const [preview, setPreview] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    const { data } = await api.get('/patient/me');
    setPatient(data);
  }

  useEffect(() => { if (!loading) load(); }, [loading]);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function savePhoto() {
    if (!file) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('photo', file);
      await authService.uploadPhoto(fd);
      toast.success('Foto actualizada');
      setPhotoModal(false);
      load();
    } catch { toast.error('Error al subir foto'); }
    finally { setSaving(false); }
  }

  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ?? 'http://localhost:8000';
  const photoUrl = patient?.user?.photo?.startsWith('http') ? patient.user.photo : `${apiBase}${patient?.user?.photo ?? '/images/default.jpg'}`;

  if (loading || !patient) return null;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Cover */}
      <div className="bg-[#013253] h-32 rounded-t-xl" />
      <div className="bg-white rounded-b-xl shadow-sm px-6 pb-6 -mt-px">
        <div className="flex flex-col items-center -mt-14 mb-6">
          <div className="relative">
            <img src={photoUrl} alt="Perfil" className="w-24 h-24 rounded-full border-4 border-white object-cover bg-gray-200 cursor-pointer" onClick={() => setPhotoModal(true)} />
            <button onClick={() => setPhotoModal(true)} className="absolute bottom-0 right-0 bg-[#7CB91D] text-white rounded-full p-1.5">
              <Camera size={14} />
            </button>
          </div>
          <h2 className="mt-3 text-xl font-bold text-[#013253]">{patient.name}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-[#013253] mb-3">Información básica</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Nombre</span><span>{patient.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Ciudad</span><span>{patient.city ?? '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Nacimiento</span><span>{patient.user?.birth ? formatDate(patient.user.birth) : '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Cédula</span><span>{patient.user?.document}</span></div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-[#013253] mb-3">Información de contacto</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Email</span><span>{patient.user?.email ?? '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Teléfono</span><span>{patient.telephone}</span></div>
            </div>
          </div>
        </div>
      </div>

      <Modal open={photoModal} onClose={() => setPhotoModal(false)} title="Actualizar foto" size="sm">
        <div className="flex flex-col gap-4 items-center">
          {preview ? <img src={preview} className="w-32 h-32 rounded-full object-cover" alt="Preview" /> : <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-400"><Camera size={32} /></div>}
          <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
          <Button variant="ghost" onClick={() => fileRef.current?.click()}>Seleccionar imagen</Button>
          <Button onClick={savePhoto} loading={saving} disabled={!file}>Guardar foto</Button>
        </div>
      </Modal>
    </div>
  );
}
