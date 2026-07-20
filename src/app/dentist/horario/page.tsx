'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading) {
      api.get('/dentist/schedule').then(({ data }) => {
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
    if (!dentistId) { toast.error('ID de odontólogo no encontrado'); return; }
    setSaving(true);
    try {
      await api.post('/dentist/schedule', { dentist_id: dentistId, schedules: slots });
      toast.success('Horario guardado');
    } catch (e: any) { toast.error(e.response?.data?.message ?? 'Error'); }
    finally { setSaving(false); }
  }

  if (loading) return null;

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
                      <select value={String(slot[key as keyof Slot])}
                        disabled={!slot.attend || (key.includes('break') && !slot.break)}
                        onChange={(e) => update(slot.day, key as keyof Slot, e.target.value)}
                        className="border border-gray-300 rounded text-xs px-1 py-1 w-full disabled:opacity-40">
                        {hours.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
