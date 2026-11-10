'use client';
import { useState, useCallback } from 'react';
import { companyService } from '@/services';
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
import { companySchema, extractErrors } from '@/lib/schemas';
import type { PaginatedResponse } from '@/interfaces/index';

interface Company { id: number; name: string; email: string | null; phone: string | null; address: string | null; city: string | null; state: string; }

const empty = { id: 0, name: '', email: '', phone: '', address: '', city: '' };

export default function EmpresasAdminPage() {
  const { loading: authLoading } = useAuth('Administrator');

  const fetchCompanies = useCallback(async ({ page }: { page: number }) => {
    const { data } = await companyService.adminList(page);
    return { ...data.meta, data: data.data } as PaginatedResponse<Company>;
  }, []);

  const {
    items,
    paginator,
    page,
    setPage,
    loading: listLoading,
    refresh,
  } = usePaginator<Company, Record<string, never>>(fetchCompanies, {} as Record<string, never>);

  const { open, title, handleOpen, handleClose } = useDialogHandler({ create: 'Nueva empresa', edit: 'Editar empresa' });

  const [form, setForm] = useState<any>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { isLoading: saving, execute } = useAsyncFormHandler();
  const { alert, showAlert, hideAlert } = useAlert();

  const handleOpenCreate = useCallback(() => {
    setForm(empty);
    setErrors({});
    handleOpen();
  }, [handleOpen]);

  const handleOpenEdit = useCallback((c: Company) => {
    setForm({ id: c.id, name: c.name, email: c.email ?? '', phone: c.phone ?? '', address: c.address ?? '', city: c.city ?? '' });
    setErrors({});
    handleOpen(c.id);
  }, [handleOpen]);

  const save = useCallback(async () => {
    const r = companySchema.safeParse(form);
    if (!r.success) { setErrors(extractErrors(r.error)); return; }
    setErrors({});

    const { id: formId, ...rest } = form;
    const payload: any = { ...rest };
    if (formId) payload.id = formId;

    const result = await execute(
      async (signal) => companyService.adminCreate(payload, signal),
      formId ? 'Empresa actualizada' : 'Empresa creada'
    );

    showAlert(result.message, result.alertSeverity);
    if (result.alertSeverity === 'success') {
      handleClose();
      refresh();
    }
  }, [form, execute, showAlert, handleClose, refresh]);

  const remove = useCallback(async (id: number) => {
    if (!confirm('¿Eliminar empresa?')) return;
    try {
      await companyService.adminDelete(id);
      toast.success('Empresa eliminada');
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
        <h1 className="text-2xl font-bold text-[#0F172A]">Empresas</h1>
        <Button onClick={handleOpenCreate}><Plus size={16} /> Crear</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#0EA5E9] text-white">
            <tr>{['Nombre', 'Email', 'Teléfono', 'Ciudad', 'Estado', ''].map(h => (
              <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3">{c.email ?? '—'}</td>
                <td className="px-4 py-3">{c.phone ?? '—'}</td>
                <td className="px-4 py-3">{c.city ?? '—'}</td>
                <td className="px-4 py-3">{c.state}</td>
                <td className="px-4 py-3 flex gap-1">
                  <button onClick={() => handleOpenEdit(c)} className="p-1.5 text-[#0F172A] hover:bg-blue-50 rounded"><Pencil size={15} /></button>
                  <button onClick={() => remove(c.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={15} /></button>
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
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <ErrorMessage message={errors.email} />
          <Input label="Teléfono" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Dirección" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <Input label="Ciudad" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <Button onClick={save} loading={saving}>Guardar</Button>
        </div>
      </Modal>
    </div>
  );
}