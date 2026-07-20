'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';

interface Slot { hour_start: string; hour_end: string; }

export default function NuevaCitaAdminContent() {
  const { loading } = useAuth('Administrator');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState<any>(null);
  const [form, setForm] = useState({ patient_id: '', procedure_id: '', dentist_procedure_id: '', branch_id: '', day: '', hour: '', type: 1 });
  const [dentistOptions, setDentistOptions] = useState<any[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [showDentistModal, setShowDentistModal] = useState(false);
  const [showSlotsModal, setShowSlotsModal] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading) {
      api.post('/staff/appointments/form-data').then(({ data }) => {
        setFormData(data);
        const pid = searchParams.get('patient_id');
        if (pid) setForm(f => ({ ...f, patient_id: pid }));
      });
    }
  }, [loading]);

  async function onProcedureChange(procedureId: string) {
    setForm(f => ({ ...f, procedure_id: procedureId, dentist_procedure_id: '', hour: '' }));
    if (!procedureId) return;
    const { data } = await api.post('/staff/appointments/by-procedure', { procedure_id: procedureId });
    setDentistOptions(data);
    setShowDentistModal(true);
  }

  async function onDateChange(date: string) {
    setForm(f => ({ ...f, day: date, hour: '' }));
    if (!date || !form.dentist_procedure_id) return;
    const { data } = await api.post('/staff/appointments/slots', { dentist_procedure_id: form.dentist_procedure_id, date });
    setSlots(data.slots ?? []);
    setShowSlotsModal(true);
  }

  function selectDentist(dpId: number) {
    setForm(f => ({ ...f, dentist_procedure_id: String(dpId) }));
    setShowDentistModal(false);
  }

  async function book() {
    setSaving(true);
    try {
      await api.post('/admin/appointments', { ...form, patient_id: Number(form.patient_id), branch_id: Number(form.branch_id), dentist_procedure_id: Number(form.dentist_procedure_id) });
      toast.success('Cita agendada');
      router.push('/admin/citas');
    } catch (e: any) { toast.error(e.response?.data?.message ?? 'Error'); }
    finally { setSaving(false); }
  }

  if (loading || !formData) return null;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-[#013253] mb-6">Nueva cita (Admin)</h1>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Paciente *</label>
          <select value={form.patient_id} onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">Seleccionar paciente</option>
            {formData.patients?.map((p: any) => <option key={p.id} value={p.id}>{p.text}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Procedimiento *</label>
          <select value={form.procedure_id} onChange={(e) => onProcedureChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">Seleccionar procedimiento</option>
            {formData.procedures?.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        {form.dentist_procedure_id && (
          <Input label="Fecha *" type="date" value={form.day} min={formData.min_date}
            onChange={(e) => onDateChange(e.target.value)} />
        )}

        {form.hour && <Input label="Hora seleccionada" value={form.hour} disabled />}

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Sede *</label>
          <select value={form.branch_id} onChange={(e) => setForm({ ...form, branch_id: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">Seleccionar sede</option>
            {formData.branches?.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>

        <Button onClick={book} loading={saving} disabled={!form.patient_id || !form.dentist_procedure_id || !form.day || !form.hour || !form.branch_id}>
          Agendar cita
        </Button>
      </div>

      <Modal open={showDentistModal} onClose={() => setShowDentistModal(false)} title="Seleccionar odontólogo" size="lg">
        <div className="space-y-3">
          {dentistOptions.map((dp: any) => (
            <div key={dp.id} className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50">
              <div>
                <p className="font-medium">{dp.dentist?.name}</p>
                <p className="text-xs text-gray-500">{dp.dentist?.schedules?.filter((s: any) => s.attend).length ?? 0} días disponibles</p>
              </div>
              <Button size="sm" onClick={() => selectDentist(dp.id)}>Seleccionar</Button>
            </div>
          ))}
        </div>
      </Modal>

      <Modal open={showSlotsModal} onClose={() => setShowSlotsModal(false)} title="Horarios disponibles">
        <div className="flex flex-wrap gap-2">
          {slots.length === 0 && <p className="text-gray-500 text-sm">No hay horarios disponibles para esta fecha.</p>}
          {slots.map((s) => (
            <button key={s.hour_start} onClick={() => { setForm(f => ({ ...f, hour: s.hour_start })); setShowSlotsModal(false); }}
              className={`px-3 py-2 rounded-full text-sm border transition-colors ${form.hour === s.hour_start ? 'bg-[#00AFF1] text-white border-[#00AFF1]' : 'border-gray-300 hover:border-[#00AFF1]'}`}>
              {s.hour_start} – {s.hour_end}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
