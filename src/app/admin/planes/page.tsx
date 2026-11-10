'use client';
import { useState, useCallback } from 'react';
import { planService } from '@/services';
import { useAuth } from '@/hooks/useAuth';
import { usePaginator } from '@/hooks/usePaginator';
import { useDialogHandler } from '@/hooks/useDialogHandler';
import { useAsyncFormHandler } from '@/hooks/useAsyncFormHandler';
import { useAlert } from '@/hooks/useAlert';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import SpinnerLoad from '@/components/web/SpinnerLoad';
import ErrorMessage from '@/components/web/ErrorMessage';
import AlertGeneric from '@/components/web/AlertGeneric';
import WebPaginator from '@/components/web/Paginator';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { planSchema, extractErrors } from '@/lib/schemas';
import type { PaginatedResponse } from '@/interfaces/index';

interface Plan { id: number; name: string; price: string; description: string; }

const empty = { id: 0, name: '', price: '', description: '' };

export default function PlanesPage() {
  const { loading: authLoading } = useAuth('Administrator');

  const fetchPlans = useCallback(async ({ page }: { page: number }) => {
    const { data } = await planService.list(page);
    return { ...data.meta, data: data.data } as PaginatedResponse<Plan>;
  }, []);

  const {
    items,
    paginator,
    page,
    setPage,
    loading: listLoading,
    refresh,
  } = usePaginator<Plan, Record<string, never>>(fetchPlans, {} as Record<string, never>);

  const { open, title, handleOpen, handleClose } = useDialogHandler({ create: 'Nuevo plan', edit: 'Editar plan' });

  const [form, setForm] = useState<any>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { isLoading: saving, execute } = useAsyncFormHandler();
  const { alert, showAlert, hideAlert } = useAlert();

  const handleOpenCreate = useCallback(() => {
    setForm(empty);
    setErrors({});
    handleOpen();
  }, [handleOpen]);

  const handleOpenEdit = useCallback((p: Plan) => {
    setForm({ id: p.id, name: p.name, price: String(p.price), description: p.description });
    setErrors({});
    handleOpen(p.id);
  }, [handleOpen]);

  const save = useCallback(async () => {
    const r = planSchema.safeParse(form);
    if (!r.success) { setErrors(extractErrors(r.error)); return; }
    setErrors({});

    const { id: formId, ...rest } = form;
    const payload: any = { ...rest, price: Number(form.price) };
    if (formId) payload.id = formId;

    const result = await execute(
      async (signal) => planService.create(payload, signal),
      formId ? 'Plan actualizado' : 'Plan creado'
    );

    showAlert(result.message, result.alertSeverity);
    if (result.alertSeverity === 'success') {
      handleClose();
      refresh();
    }
  }, [form, execute, showAlert, handleClose, refresh]);

  const remove = useCallback(async (id: number) => {
    if (!confirm('¿Eliminar plan?')) return;
    try {
      await planService.delete(id);
      toast.success('Plan eliminado');
      refresh();
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Error al eliminar');
    }
  }, [refresh]);

  if (authLoading) return null;
  if (listLoading) return <SpinnerLoad />;

  return (
    <div>
      <AlertGeneric severity={alert.severity} message={alert.message} open={alert.open} onClose={hideAlert} />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#0F172A]">Planes</h1>
        <Button onClick={handleOpenCreate}><Plus size={16} /> Crear</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#0EA5E9] text-white">
            <tr>{['Nombre', 'Precio', 'Descripción', ''].map(h => (
              <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3">${p.price}</td>
                <td className="px-4 py-3 max-w-md truncate">{p.description}</td>
                <td className="px-4 py-3 flex gap-1">
                  <button onClick={() => handleOpenEdit(p)} className="p-1.5 text-[#0F172A] hover:bg-blue-50 rounded"><Pencil size={15} /></button>
                  <button onClick={() => remove(p.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <WebPaginator paginator={paginator} page={page} setPage={setPage} />
      </div>

      <Modal open={open} onClose={handleClose} title={title}>
        <div className="grid gap-3">
          <Input label="Nombre *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <ErrorMessage message={errors.name} />
          <Input label="Precio ($) *" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <ErrorMessage message={errors.price} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Descripción *</label>
            <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-[#0EA5E9] outline-none resize-none" />
            {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
          </div>
          <Button onClick={save} loading={saving}>Guardar</Button>
        </div>
      </Modal>
    </div>
  );
}