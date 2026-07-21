'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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

interface Slot { day: number; attend: boolean; hour_start: string; hour_end: string; break: boolean; break_start: string; break_end: string; }

function defaultSlots(): Slot[] {
  return Array.from({ length: 6 }, (_, i) => ({ day: i + 1, attend: false, hour_start: '08:00', hour_end: '17:00', break: false, break_start: '12:00', break_end: '13:00' }));
}

export default function HorarioPage() {
  const { loading } = useAuth('Administrator');
  const params = useParams();
  const dentistId = Number(params.id);
  const [slots, setSlots] = useState<Slot[]>(defaultSlots());
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const { data } = await api.get(`/admin/dentists/${dentistId}/schedule`);
      if (data.length > 0) {
        const filled = defaultSlots().map((def, i) => {
          const found = data.find((s: any) => s.day === i + 1);
          return found ? { ...def, ...found } : def;
        });
        setSlots(filled);
      }
    } catch { toast.error('Error al cargar horario'); }
  }

  useEffect(() => { if (!loading) load(); }, [loading]);

  function update(day: number, key: keyof Slot, val: any) {
    setSlots(prev => prev.map(s => s.day === day ? { ...s, [key]: val } : s));
  }

  async function save() {
    setSaving(true);
    try {
      await api.post('/admin/dentists/schedule', { dentist_id: dentistId, schedules: slots });
      toast.success('Horario guardado');
    } catch (e: any) { toast.error(e.response?.data?.message ?? 'Error'); }
    finally { setSaving(false); }
  }

  if (loading) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#0F172A]">Horario del odontólogo</h1>
        <Button onClick={save} loading={saving}>Guardar</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#0EA5E9] text-white">
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
                        className="w-4 h-4 accent-[#0EA5E9]" />
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
