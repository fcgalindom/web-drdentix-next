'use client';
import { useEffect, useState } from 'react';
import { dentistService } from '@/services';
import { useAuth } from '@/hooks/useAuth';
import { useAsyncFormHandler } from '@/hooks/useAsyncFormHandler';
import { useAlert } from '@/hooks/useAlert';
import SpinnerLoad from '@/components/web/SpinnerLoad';
import AlertGeneric from '@/components/web/AlertGeneric';
import Button from '@/components/ui/Button';
import AppSelect from '@/components/ui/AppSelect';

const DAYS = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
const hours = Array.from({ length: 41 }, (_, i) => {
  const h = Math.floor(i * 15 / 60) + 8;
  const m = (i * 15) % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
});

interface Slot { day: number; attend: boolean; hour_start: string; hour_end: string; break: boolean; break_start: string; break_end: string; dentist_id?: number; }

function defaultSlots(): Slot[] {
  return Array.from({ length: 6 }, (_, i) => ({ day: i + 1, attend: false, hour_start: '08:00', hour_end: '17:00', break: false, break_start: '12:00', break_end: '13:00' }));
}

export default function DentistHorarioPage() {
  const { user, loading } = useAuth('Dentist');
  const [slots, setSlots] = useState<Slot[]>(defaultSlots());
  const [dentistId, setDentistId] = useState<number | null>(null);
  const { execute, isLoading: saving } = useAsyncFormHandler();
  const { alert, showAlert, hideAlert } = useAlert();

  useEffect(() => {
    if (!loading) {
      dentistService.getMySchedule().then(({ data }) => {
        if (data.length > 0) {
          setDentistId(data[0].dentist_id ?? null);
          const filled = defaultSlots().map((def, i) => {
            const found = data.find((s: any) => s.day === i + 1);
            return found ? { ...def, ...found } : def;
          });
          setSlots(filled);
        }
      });
    }
  }, [loading]);

  function update(day: number, key: keyof Slot, val: any) {
    setSlots(prev => prev.map(s => s.day === day ? { ...s, [key]: val } : s));
  }

  async function save() {
    if (!dentistId) { showAlert('ID de odontólogo no encontrado', 'error'); return; }
    const hasAttend = slots.some(s => s.attend);
    if (!hasAttend) { showAlert('Selecciona al menos un día de atención', 'warning'); return; }
    for (const s of slots) {
      if (s.attend && s.hour_start === s.hour_end) { showAlert(`El ${DAYS[s.day-1]} tiene hora inicio igual a hora fin`, 'warning'); return; }
      if (s.attend && s.break && s.break_start === s.break_end) { showAlert(`El descanso del ${DAYS[s.day-1]} tiene inicio igual a fin`, 'warning'); return; }
    }
    await execute(signal => dentistService.saveMySchedule(dentistId, slots, signal), 'Horario guardado');
  }

  if (loading) return <SpinnerLoad />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#013253]">Mi horario</h1>
        <Button onClick={save} loading={saving}>Guardar</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#00AFF1] text-white">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Asunto</th>
              {DAYS.map(d => <th key={d} className="px-3 py-3 text-center font-semibold min-w-[110px]">{d}</th>)}
            </tr>
          </thead>
          <tbody>
            {[
              { label: 'Atiende', key: 'attend', type: 'check' },
              { label: 'Hora inicio', key: 'hour_start', type: 'select' },
              { label: 'Hora fin', key: 'hour_end', type: 'select' },
              { label: 'Descanso', key: 'break', type: 'check' },
              { label: 'Inicio descanso', key: 'break_start', type: 'select' },
              { label: 'Fin descanso', key: 'break_end', type: 'select' },
            ].map(({ label, key, type }) => (
              <tr key={key} className="border-t">
                <td className="px-4 py-3 font-medium text-gray-700 bg-gray-50">{label}</td>
                {slots.map(slot => (
                  <td key={slot.day} className="px-3 py-2 text-center">
                    {type === 'check' ? (
                      <input type="checkbox" checked={Boolean(slot[key as keyof Slot])}
                        onChange={(e) => update(slot.day, key as keyof Slot, e.target.checked)}
                        className="w-4 h-4 accent-[#00AFF1]" />
                    ) : (
                      <AppSelect
                        options={hours.map(h => ({ value: h, label: h }))}
                        value={String(slot[key as keyof Slot])}
                        isDisabled={!slot.attend || (key.includes('break') && !slot.break)}
                        onChange={(val) => update(slot.day, key as keyof Slot, val)}
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AlertGeneric severity={alert.severity} message={alert.message} open={alert.open} onClose={hideAlert} />
    </div>
  );
}
