'use client';
import { useState, useCallback } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { usePaginator } from '@/hooks/usePaginator';
import { useDialogHandler } from '@/hooks/useDialogHandler';
import { useAsyncFormHandler } from '@/hooks/useAsyncFormHandler';
import { useStatusToggle } from '@/hooks/useStatusToggle';
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
import { branchSchema, extractErrors } from '@/lib/schemas';
import type { PaginatedResponse } from '@/interfaces/index';

interface Branch { id: number; name: string; address: string; contact: string; city: string; state: string; }

export default function SedesPage() {
  const { loading: authLoading } = useAuth('Administrator');

  const fetchBranches = useCallback(async ({ page }: { page: number }) => {
    const { data } = await api.get(`/admin/branches?page=${page}`);
    return { ...data.meta, data: data.data } as PaginatedResponse<Branch>;
  }, []);

  const {
    items: branches,
    paginator,
    page,
    setPage,
    loading: listLoading,
    refresh,
    setItems,
  } = usePaginator<Branch, Record<string, never>>(fetchBranches, {} as Record<string, never>);

  const toggleStateApi = useCallback(async (newValue: boolean, id: number) => {
    return api.post('/admin/branches/state', { id, state: newValue ? 'Activo' : 'Inactivo' }) as ReturnType<typeof api.post<Branch>>;
  }, []);

  const { handleChangeActive } = useStatusToggle<Branch>({
    setItems,
    apiCall: toggleStateApi,
    refresh,
    fieldName: 'state' as keyof Branch,
  });

  const { open, title, handleOpen, handleClose } = useDialogHandler({ create: 'Nueva sede', edit: 'Editar sede' });

  const [form, setForm] = useState({ id: 0, name: '', address: '', contact: '', city: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { isLoading: saving, execute } = useAsyncFormHandler();
  const { alert, showAlert, hideAlert } = useAlert();

  const handleOpenCreate = useCallback(() => {
    setForm({ id: 0, name: '', address: '', contact: '', city: '' });
    setErrors({});
    handleOpen();
  }, [handleOpen]);

  const handleOpenEdit = useCallback((b: Branch) => {
    setForm({ id: b.id, name: b.name, address: b.address, contact: b.contact, city: b.city });
    setErrors({});
    handleOpen(b.id);
  }, [handleOpen]);

  const save = useCallback(async () => {
    const r = branchSchema.safeParse(form);
    if (!r.success) { setErrors(extractErrors(r.error)); return; }
    setErrors({});

    const { id: formId, ...rest } = form;
    const payload: Record<string, unknown> = { ...rest };
    if (formId) payload.id = formId;

    const result = await execute(
      async (signal) => api.post('/admin/branches', payload, { signal }),
      formId ? 'Sede actualizada' : 'Sede creada'
    );

    showAlert(result.message, result.alertSeverity);
    if (result.alertSeverity === 'success') {
      if (formId) toast.success('Sede actualizada');
      else toast.success('Sede creada');
      handleClose();
      refresh();
    }
  }, [form, execute, showAlert, handleClose, refresh]);

  if (authLoading) return <div className="flex items-center justify-center h-64"><span className="text-gray-400">Cargando...</span></div>;
  if (listLoading) return <SpinnerLoad />;

  return (
    <div>
      <AlertGeneric severity={alert.severity} message={alert.message} open={alert.open} onClose={hideAlert} />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#0F172A]">Sedes</h1>
        <Button onClick={handleOpenCreate}><Plus size={16} /> Crear</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#0EA5E9] text-white">
            <tr>
              {['Nombre', 'Dirección', 'Contacto', 'Ciudad', 'Estado', 'Acciones'].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {branches.map((b) => (
              <tr key={b.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{b.name}</td>
                <td className="px-4 py-3 text-gray-600">{b.address}</td>
                <td className="px-4 py-3 text-gray-600">{b.contact}</td>
                <td className="px-4 py-3 text-gray-600">{b.city}</td>
                <td className="px-4 py-3">
                  <Toggle
                    active={b.state === 'Activo'}
                    onToggle={() => {
                      const event = { target: { checked: b.state !== 'Activo' } } as React.ChangeEvent<HTMLInputElement>;
                      handleChangeActive(event, b);
                    }}
                  />
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleOpenEdit(b)} className="p-1.5 text-[#0F172A] hover:bg-blue-50 rounded"><Pencil size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <WebPaginator paginator={paginator} page={page} setPage={setPage} />
      </div>

      <Modal open={open} onClose={handleClose} title={title} size="sm">
        <div className="grid gap-3">
          <Input label="Nombre *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <ErrorMessage message={errors.name} />
          <Input label="Dirección *" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <ErrorMessage message={errors.address} />
          <Input label="Contacto *" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
          <ErrorMessage message={errors.contact} />
          <Input label="Ciudad *" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <ErrorMessage message={errors.city} />
          <Button onClick={save} loading={saving}>Guardar</Button>
        </div>
      </Modal>
    </div>
  );
}
