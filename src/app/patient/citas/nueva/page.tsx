'use client';
import { useEffect, useState } from 'react';
import { appointmentService } from '@/services';
import { patientAppointmentSchema, extractErrors } from '@/lib/schemas';
import { useAuth } from '@/hooks/useAuth';
import { useAsyncFormHandler } from '@/hooks/useAsyncFormHandler';
import { useAlert } from '@/hooks/useAlert';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import AlertGeneric from '@/components/web/AlertGeneric';
import SpinnerLoad from '@/components/web/SpinnerLoad';
import ErrorMessage from '@/components/web/ErrorMessage';
import { useRouter } from 'next/navigation';

interface Slot { hour_start: string; hour_end: string; }

export default function NuevaCitaPatient() {
  const { loading } = useAuth('Patient');
  const router = useRouter();
  const [formData, setFormData] = useState<any>(null);
  const [form, setForm] = useState({ procedure_id: '', dentist_procedure_id: '', branch_id: '', day: '', hour: '', agreed: false });
  const [dentistOptions, setDentistOptions] = useState<any[]>([]);
  const [selectedDentistName, setSelectedDentistName] = useState('');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [showDentistModal, setShowDentistModal] = useState(false);
  const [showSlotsModal, setShowSlotsModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { execute, isLoading: saving } = useAsyncFormHandler();
  const { alert, showAlert, hideAlert } = useAlert();

  useEffect(() => {
    if (!loading) {
      appointmentService.getFormDataPatient().then(({ data }) => setFormData(data));
    }
  }, [loading]);

  async function onProcedureChange(procedureId: string) {
    setForm(f => ({ ...f, procedure_id: procedureId, dentist_procedure_id: '', hour: '' }));
    setSelectedDentistName('');
    if (!procedureId) return;
    const { data } = await appointmentService.getByProcedurePatient(procedureId);
    setDentistOptions(data);
    setShowDentistModal(true);
  }

  async function selectDentist(dp: any) {
    setForm(f => ({ ...f, dentist_procedure_id: String(dp.id) }));
    setSelectedDentistName(dp.dentist?.name ?? '');
    setShowDentistModal(false);
  }

  async function onDateChange(date: string) {
    setForm(f => ({ ...f, day: date, hour: '' }));
    if (!date || !form.dentist_procedure_id) return;
    const { data } = await appointmentService.getSlotsPatient(form.dentist_procedure_id, date);
    setSlots(data.slots ?? []);
    setShowSlotsModal(true);
  }

  async function book() {
    const r = patientAppointmentSchema.safeParse(form);
    if (!r.success) { setErrors(extractErrors(r.error)); return; }
    setErrors({});
    const result = await execute(signal => appointmentService.createPatient({ dentist_procedure_id: Number(form.dentist_procedure_id), branch_id: Number(form.branch_id), day: form.day, hour: form.hour }, signal), '¡Cita agendada!');
    if (result.response) {
      router.push('/patient/citas');
    }
  }

  if (loading || !formData) return <SpinnerLoad />;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-[#013253] mb-6">Agendar cita</h1>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Procedimiento *</label>
          <select value={form.procedure_id} onChange={(e) => onProcedureChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">Seleccionar procedimiento</option>
            {formData.procedures?.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <ErrorMessage message={errors.dentist_procedure_id} />
        </div>

        {selectedDentistName && <Input label="Odontólogo seleccionado" value={selectedDentistName} disabled />}

        {form.dentist_procedure_id && (
          <Input label="Fecha *" type="date" value={form.day} min={formData.min_date}
            onChange={(e) => onDateChange(e.target.value)} error={errors.day} />
        )}

        {form.hour && <Input label="Hora seleccionada" value={form.hour} disabled />}

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Sede *</label>
          <select value={form.branch_id} onChange={(e) => setForm({ ...form, branch_id: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">Seleccionar sede</option>
            {formData.branches?.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <ErrorMessage message={errors.branch_id} />
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input type="checkbox" checked={form.agreed} onChange={(e) => setForm({ ...form, agreed: e.target.checked })}
            className="w-4 h-4 accent-[#7CB91D]" />
          He leído la ley 1581 de 2012 (protección de datos)
        </label>
        <ErrorMessage message={errors.agreed} />

        <Button onClick={book} loading={saving} disabled={!form.dentist_procedure_id || !form.day || !form.hour || !form.branch_id}>
          Agendar cita
        </Button>
      </div>

      {/* Dentist modal */}
      <Modal open={showDentistModal} onClose={() => setShowDentistModal(false)} title="Seleccionar odontólogo" size="lg">
        <div className="space-y-3">
          {dentistOptions.length === 0 && <p className="text-gray-500 text-sm">No hay odontólogos disponibles para este procedimiento.</p>}
          {dentistOptions.map((dp: any) => (
            <div key={dp.id} className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50">
              <div>
                <p className="font-medium">{dp.dentist?.name}</p>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day, i) => {
                    const has = dp.dentist?.schedules?.find((s: any) => s.day === i + 1 && s.attend);
                    return has ? <span key={i} className="text-xs bg-[#e1fea4] text-[#013253] px-2 py-0.5 rounded-full">{day}</span> : null;
                  })}
                </div>
              </div>
              <Button size="sm" onClick={() => selectDentist(dp)}>Seleccionar</Button>
            </div>
          ))}
        </div>
      </Modal>

      {/* Slots modal */}
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

      <AlertGeneric severity={alert.severity} message={alert.message} open={alert.open} onClose={hideAlert} />
    </div>
  );
}
