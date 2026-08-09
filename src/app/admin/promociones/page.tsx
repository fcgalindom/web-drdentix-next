'use client';
import { useState, useCallback } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { usePaginator } from '@/hooks/usePaginator';
import { useDialogHandler } from '@/hooks/useDialogHandler';
import { useAsyncFormHandler } from '@/hooks/useAsyncFormHandler';
import { useAlert } from '@/hooks/useAlert';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Toggle from '@/components/ui/Toggle';
import SpinnerLoad from '@/components/web/SpinnerLoad';
import ErrorMessage from '@/components/web/ErrorMessage';
import AlertGeneric from '@/components/web/AlertGeneric';
import WebPaginator from '@/components/web/Paginator';
import toast from 'react-hot-toast';
import { Plus, Pencil } from 'lucide-react';
import { promotionSchema, extractErrors } from '@/lib/schemas';
import type { PaginatedResponse } from '@/interfaces/index';

interface Promo { id: number; date_start: string; date_end: string; details: string; discount: number; limit_patients: number; status: number; }

const empty = { id: 0, date_start: '', date_end: '', details: '', discount: '', limit_patients: '' };

export default function PromocionesPage() {
  const { loading: authLoading } = useAuth('Administrator');

  const fetchPromotions = useCallback(async ({ page }: { page: number }) => {
    const { data } = await api.get(`/admin/promotions?page=${page}`);
    return { ...data.meta, data: data.data } as PaginatedResponse<Promo>;
  }, []);

  const {
    items,
    paginator,
    page,
    setPage,
    loading: listLoading,
    refresh,
  } = usePaginator<Promo, Record<string, never>>(fetchPromotions, {} as Record<string, never>);

  const { open, title, handleOpen, handleClose } = useDialogHandler({ create: 'Nueva promoción', edit: 'Editar promoción' });

  const [form, setForm] = useState<any>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { isLoading: saving, execute } = useAsyncFormHandler();
  const { alert, showAlert, hideAlert } = useAlert();

  const handleOpenCreate = useCallback(() => {
    setForm(empty);
    setErrors({});
    handleOpen();
  }, [handleOpen]);

  const handleOpenEdit = useCallback((p: Promo) => {
    setForm({ id: p.id, date_start: p.date_start, date_end: p.date_end, details: p.details, discount: String(p.discount), limit_patients: String(p.limit_patients) });
    setErrors({});
    handleOpen(p.id);
  }, [handleOpen]);

  const save = useCallback(async () => {
    const r = promotionSchema.safeParse(form);
    if (!r.success) { setErrors(extractErrors(r.error)); return; }
    setErrors({});

    const { id: formId, ...rest } = form;
    const payload: any = { ...rest, discount: Number(form.discount), limit_patients: Number(form.limit_patients) };
    if (formId) payload.id = formId;

    const result = await execute(
      async (signal) => api.post('/admin/promotions', payload, { signal }),
      formId ? 'Promoción actualizada' : 'Promoción creada'
    );

    showAlert(result.message, result.alertSeverity);
    if (result.alertSeverity === 'success') {
      if (formId) toast.success('Promoción actualizada');
      else toast.success('Promoción creada');
      handleClose();
      refresh();
    }
  }, [form, execute, showAlert, handleClose, refresh]);

  const deactivate = useCallback(async (p: Promo) => {
    try {
      await api.post('/admin/promotions/deactivate', { id: p.id });
      toast.success('Promoción desactivada');
      refresh();
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Error al desactivar');
    }
  }, [refresh]);

  if (authLoading) return <div className="flex items-center justify-center h-64"><span className="text-gray-400">Cargando...</span></div>;
  if (listLoading) return <SpinnerLoad />;

  return (
    <div>
      <AlertGeneric severity={alert.severity} message={alert.message} open={alert.open} onClose={hideAlert} />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#0F172A]">Promociones</h1>
        <Button onClick={handleOpenCreate}><Plus size={16} /> Crear</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#0EA5E9] text-white">
            <tr>{['Fecha inicio', 'Fecha fin', 'Detalle', 'Descuento', 'Límite', 'Estado', ''].map(h => (
              <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{p.date_start}</td>
                <td className="px-4 py-3">{p.date_end}</td>
                <td className="px-4 py-3 max-w-xs truncate">{p.details}</td>
                <td className="px-4 py-3">{p.discount}%</td>
                <td className="px-4 py-3">{p.limit_patients}</td>
                <td className="px-4 py-3"><Toggle active={p.status === 1} onToggle={() => deactivate(p)} /></td>
                <td className="px-4 py-3">
                  <button onClick={() => handleOpenEdit(p)} className="p-1.5 text-[#0F172A] hover:bg-blue-50 rounded"><Pencil size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <WebPaginator paginator={paginator} page={page} setPage={setPage} />
      </div>

      <Modal open={open} onClose={handleClose} title={title}>
        <div className="grid gap-3">
          <Input label="Fecha inicio *" type="date" value={form.date_start} onChange={(e) => setForm({ ...form, date_start: e.target.value })} />
          <ErrorMessage message={errors.date_start} />
          <Input label="Fecha fin *" type="date" value={form.date_end} onChange={(e) => setForm({ ...form, date_end: e.target.value })} />
          <ErrorMessage message={errors.date_end} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Detalles *</label>
            <textarea rows={4} value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-[#0EA5E9] outline-none resize-none" />
            {errors.details && <p className="text-xs text-red-500">{errors.details}</p>}
          </div>
          <Input label="Descuento (%)" type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} />
          <ErrorMessage message={errors.discount} />
          <Input label="Límite de pacientes" type="number" value={form.limit_patients} onChange={(e) => setForm({ ...form, limit_patients: e.target.value })} />
          <ErrorMessage message={errors.limit_patients} />
          <Button onClick={save} loading={saving}>Guardar</Button>
        </div>
      </Modal>
    </div>
  );
}
