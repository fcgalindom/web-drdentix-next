'use client';
import { useEffect, useState } from 'react';
import { appointmentService } from '@/services';
import { appointmentSchema, extractErrors } from '@/lib/schemas';
import { useAuth } from '@/hooks/useAuth';
import { useAsyncFormHandler } from '@/hooks/useAsyncFormHandler';
import { useAlert } from '@/hooks/useAlert';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import AlertGeneric from '@/components/web/AlertGeneric';
import SpinnerLoad from '@/components/web/SpinnerLoad';
import ErrorMessage from '@/components/web/ErrorMessage';
import { useRouter, useSearchParams } from 'next/navigation';
import AppSelect from '@/components/ui/AppSelect';

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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { execute, isLoading: saving } = useAsyncFormHandler();
  const { alert, showAlert, hideAlert } = useAlert();

  useEffect(() => {
    if (!loading) {
      appointmentService.getFormDataAdmin().then(({ data }) => {
        setFormData(data);
        const pid = searchParams.get('patient_id');
        if (pid) setForm(f => ({ ...f, patient_id: pid }));
      });
    }
  }, [loading]);

  async function onProcedureChange(procedureId: string) {
    setForm(f => ({ ...f, procedure_id: procedureId, dentist_procedure_id: '', hour: '' }));
    if (!procedureId) return;
    const { data } = await appointmentService.getByProcedure(procedureId);
    setDentistOptions(data.data ?? data);
    setShowDentistModal(true);
  }

  async function onDateChange(date: string) {
    setForm(f => ({ ...f, day: date, hour: '' }));
    if (!date || !form.dentist_procedure_id) return;
    const { data } = await appointmentService.getSlots(form.dentist_procedure_id, date);
    setSlots(data.slots ?? []);
    setShowSlotsModal(true);
  }

  function selectDentist(dpId: number) {
    setForm(f => ({ ...f, dentist_procedure_id: String(dpId) }));
    setShowDentistModal(false);
  }

  async function book() {
    const r = appointmentSchema.safeParse(form);
    if (!r.success) { setErrors(extractErrors(r.error)); return; }
    setErrors({});
    const result = await execute(signal => appointmentService.createAdmin({ ...form, patient_id: Number(form.patient_id), branch_id: Number(form.branch_id), dentist_procedure_id: Number(form.dentist_procedure_id) }, signal), 'Cita agendada');
    if (result.response) {
      router.push('/admin/citas');
    }
  }

  if (loading || !formData) return <SpinnerLoad />;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-[#0F172A] mb-6">Nueva cita (Admin)</h1>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Paciente *</label>
          <AppSelect
            options={formData.patients?.map((p: any) => ({ value: p.id, label: p.text })) ?? []}
            value={form.patient_id}
            onChange={(val) => setForm({ ...form, patient_id: val })}
            placeholder="Seleccionar paciente"
          />
          <ErrorMessage message={errors.patient_id} />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Procedimiento *</label>
          <AppSelect
            options={formData.procedures?.map((p: any) => ({ value: p.id, label: p.name })) ?? []}
            value={form.procedure_id}
            onChange={onProcedureChange}
            placeholder="Seleccionar procedimiento"
          />
          <ErrorMessage message={errors.procedure_id} />
        </div>

        {form.dentist_procedure_id && (
          <Input label="Fecha *" type="date" value={form.day} min={formData.min_date}
            onChange={(e) => onDateChange(e.target.value)} error={errors.day} />
        )}

        {form.hour && <Input label="Hora seleccionada" value={form.hour} disabled />}

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Sede *</label>
          <AppSelect
            options={formData.branches?.map((b: any) => ({ value: b.id, label: b.name })) ?? []}
            value={form.branch_id}
            onChange={(val) => setForm({ ...form, branch_id: val })}
            placeholder="Seleccionar sede"
          />
          <ErrorMessage message={errors.branch_id} />
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
              className={`px-3 py-2 rounded-full text-sm border transition-colors ${form.hour === s.hour_start ? 'bg-[#0EA5E9] text-white border-[#0EA5E9]' : 'border-gray-300 hover:border-[#0EA5E9]'}`}>
              {s.hour_start} – {s.hour_end}
            </button>
          ))}
        </div>
      </Modal>

      <AlertGeneric severity={alert.severity} message={alert.message} open={alert.open} onClose={hideAlert} />
    </div>
  );
}
