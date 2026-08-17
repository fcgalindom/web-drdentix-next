'use client';
import { useState, useCallback } from 'react';
import { productService } from '@/services';
import { useAuth } from '@/hooks/useAuth';
import { usePaginator } from '@/hooks/usePaginator';
import { useDialogHandler } from '@/hooks/useDialogHandler';
import { useAsyncFormHandler } from '@/hooks/useAsyncFormHandler';
import { useAlert } from '@/hooks/useAlert';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import WebPaginator from '@/components/web/Paginator';
import SpinnerLoad from '@/components/web/SpinnerLoad';
import ErrorMessage from '@/components/web/ErrorMessage';
import AlertGeneric from '@/components/web/AlertGeneric';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { productSchema, extractErrors } from '@/lib/schemas';
import type { PaginatedResponse } from '@/interfaces/index';

interface Product { id: number; active_principle: string; concentration: string; amount: number; pharmaceutical_form: string; commercial_presentation: string; medication_unit: string; batch: string; health_register_invima: string; expiration_date: string; semaphore: string; date_of_admission: string; }

const empty = { id: 0, active_principle: '', concentration: '', amount: '', pharmaceutical_form: '', commercial_presentation: '', medication_unit: '', batch: '', health_register_invima: '', expiration_date: '', date_of_admission: '' };

export default function ProductosPage() {
  const { loading: authLoading } = useAuth('Administrator');

  const fetchProducts = useCallback(async ({ page }: { page: number }) => {
    const { data } = await productService.list(page);
    return { ...data.meta, data: data.data } as PaginatedResponse<Product>;
  }, []);

  const {
    items: products,
    paginator,
    page,
    setPage,
    loading: listLoading,
    refresh,
  } = usePaginator<Product, Record<string, never>>(fetchProducts, {} as Record<string, never>);

  const { open, title, handleOpen, handleClose } = useDialogHandler({ create: 'Nuevo producto', edit: 'Editar producto' });

  const [form, setForm] = useState<any>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { isLoading: saving, execute } = useAsyncFormHandler();
  const { alert, showAlert, hideAlert } = useAlert();

  function f(key: string, val: string) { setForm((prev: any) => ({ ...prev, [key]: val })); }

  const save = useCallback(async () => {
    const r = productSchema.safeParse(form);
    if (!r.success) { setErrors(extractErrors(r.error)); return; }
    setErrors({});

    const { id: formId, ...rest } = form;
    const payload: any = { ...rest, amount: Number(form.amount) };
    if (formId) payload.id = formId;

    const result = await execute(
      async (signal) => productService.create(payload, signal),
      formId ? 'Producto actualizado' : 'Producto creado'
    );

    showAlert(result.message, result.alertSeverity);
    if (result.alertSeverity === 'success') {
      handleClose();
      refresh();
    }
  }, [form, execute, showAlert, handleClose, refresh]);

  async function remove(id: number) {
    if (!confirm('¿Eliminar producto?')) return;
    await productService.delete(id);
    toast.success('Eliminado');
    refresh();
  }

  const semColors: Record<string, string> = { verde: 'semaforo-verde', amarillo: 'semaforo-amarillo', rojo: 'semaforo-rojo' };

  if (authLoading) return null;
  if (listLoading) return <SpinnerLoad />;

  return (
    <div>
      <AlertGeneric severity={alert.severity} message={alert.message} open={alert.open} onClose={hideAlert} />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#0F172A]">Inventario médico</h1>
        <Button onClick={() => { setForm(empty); setErrors({}); handleOpen(); }}><Plus size={16} /> Crear</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm whitespace-nowrap">
          <thead className="bg-[#0EA5E9] text-white">
            <tr>{['N°', 'Principio activo', 'Concentración', 'Cant.', 'Forma farmacéutica', 'Presentación', 'Semáforo', 'Vencimiento', 'Ingreso', ''].map(h => (
              <th key={h} className="px-3 py-3 text-left font-semibold">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2 text-gray-500">{i + 1}</td>
                <td className="px-3 py-2 font-medium">{p.active_principle}</td>
                <td className="px-3 py-2 text-gray-600">{p.concentration}</td>
                <td className="px-3 py-2 text-gray-600">{p.amount}</td>
                <td className="px-3 py-2 text-gray-600">{p.pharmaceutical_form}</td>
                <td className="px-3 py-2 text-gray-600">{p.commercial_presentation}</td>
                <td className="px-3 py-2">
                  <span className={cn('px-2 py-0.5 rounded text-xs font-medium', semColors[p.semaphore] ?? '')}>{p.semaphore}</span>
                </td>
                <td className="px-3 py-2 text-gray-600">{p.expiration_date}</td>
                <td className="px-3 py-2 text-gray-600">{p.date_of_admission}</td>
                <td className="px-3 py-2 flex gap-1">
                  <button onClick={() => { setForm({ ...p, amount: String(p.amount) }); setErrors({}); handleOpen(p.id); }} className="p-1.5 text-[#0F172A] hover:bg-blue-50 rounded"><Pencil size={14} /></button>
                  <button onClick={() => remove(p.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <WebPaginator paginator={paginator} page={page} setPage={setPage} />
      </div>

      <Modal open={open} onClose={handleClose} title={title} size="xl">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Principio activo *" value={form.active_principle} onChange={(e) => f('active_principle', e.target.value)} />
          <ErrorMessage message={errors.active_principle} />
          <Input label="Concentración *" value={form.concentration} onChange={(e) => f('concentration', e.target.value)} />
          <ErrorMessage message={errors.concentration} />
          <Input label="Cantidad *" type="number" value={form.amount} onChange={(e) => f('amount', e.target.value)} />
          <ErrorMessage message={errors.amount} />
          <Input label="Forma farmacéutica *" value={form.pharmaceutical_form} onChange={(e) => f('pharmaceutical_form', e.target.value)} />
          <ErrorMessage message={errors.pharmaceutical_form} />
          <Input label="Presentación comercial *" value={form.commercial_presentation} onChange={(e) => f('commercial_presentation', e.target.value)} />
          <ErrorMessage message={errors.commercial_presentation} />
          <Input label="Unidad de medida *" value={form.medication_unit} onChange={(e) => f('medication_unit', e.target.value)} />
          <ErrorMessage message={errors.medication_unit} />
          <Input label="Lote/serie *" value={form.batch} onChange={(e) => f('batch', e.target.value)} />
          <ErrorMessage message={errors.batch} />
          <Input label="Reg. sanitario INVIMA *" value={form.health_register_invima} onChange={(e) => f('health_register_invima', e.target.value)} />
          <ErrorMessage message={errors.health_register_invima} />
          <Input label="Fecha de vencimiento *" type="date" value={form.expiration_date} onChange={(e) => f('expiration_date', e.target.value)} />
          <ErrorMessage message={errors.expiration_date} />
          <Input label="Fecha de ingreso *" type="date" value={form.date_of_admission} onChange={(e) => f('date_of_admission', e.target.value)} />
          <ErrorMessage message={errors.date_of_admission} />
          <div className="col-span-2"><Button onClick={save} loading={saving} className="w-full justify-center">Guardar</Button></div>
        </div>
      </Modal>
    </div>
  );
}
