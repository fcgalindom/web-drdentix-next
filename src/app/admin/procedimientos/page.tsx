'use client';
import { useState } from 'react';
import api from '@/lib/api';
import { procedureSchema, extractErrors } from '@/lib/schemas';
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
import Paginator from '@/components/web/Paginator';
import { Plus, Pencil } from 'lucide-react';

interface Procedure { id: number; name: string; duration: number; state: string; }

export default function ProcedimientosPage() {
  const { loading: authLoading } = useAuth('Administrator');
  const { alert, showAlert, hideAlert } = useAlert();

  const {
    items, setItems, paginator, page, setPage, loading, refresh
  } = usePaginator<Procedure, {}>(
    (params) => api.get(`/admin/procedures?page=${params.page}`).then(r => r.data),
    {}
  );

  const { open, title, handleOpen, handleClose } = useDialogHandler({
    create: 'Nuevo procedimiento',
    edit: 'Editar procedimiento',
  });

  const { isLoading: saving, execute } = useAsyncFormHandler();

  const { handleChangeActive } = useStatusToggle<Procedure>({
    setItems,
    apiCall: async (newValue, id) => {
      return api.post('/admin/procedures/state', { id, state: newValue ? 'Activo' : 'Inactivo' });
    },
    refresh,
    fieldName: 'state' as keyof Procedure,
  });

  const [form, setForm] = useState({ id: 0, name: '', duration: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function openCreate() {
    setForm({ id: 0, name: '', duration: '' });
    setErrors({});
    handleOpen();
  }

  function openEdit(p: Procedure) {
    setForm({ id: p.id, name: p.name, duration: String(p.duration) });
    setErrors({});
    handleOpen(p.id);
  }

  async function save() {
    const r = procedureSchema.safeParse(form);
    if (!r.success) { setErrors(extractErrors(r.error)); return; }
    setErrors({});
    const result = await execute(
      async (_signal) => {
        const { id: formId, ...rest } = form;
        const payload: any = { ...rest, duration: Number(form.duration) };
        if (formId) payload.id = formId;
        return api.post('/admin/procedures', payload);
      },
      'Guardado'
    );
    if (result.alertSeverity === 'success') {
      showAlert(result.message, 'success');
      handleClose();
      refresh();
    }
  }

  if (authLoading || loading) return <SpinnerLoad />;

  return (
    <div>
      <AlertGeneric severity={alert.severity} message={alert.message} open={alert.open} onClose={hideAlert} />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#0F172A]">Procedimientos</h1>
        <Button onClick={openCreate}><Plus size={16} /> Crear</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#0EA5E9] text-white">
            <tr>
              {['Nombre', 'Duración', 'Estado', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-gray-600">{p.duration} minutos</td>
                <td className="px-4 py-3">
                  <Toggle
                    active={p.state === 'Activo'}
                    onToggle={() => handleChangeActive({ target: { checked: p.state !== 'Activo' } } as any, p)}
                  />
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => openEdit(p)} className="p-1.5 text-[#0F172A] hover:bg-blue-50 rounded">
                    <Pencil size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Paginator paginator={paginator} page={page} setPage={setPage} />
      </div>

      <Modal open={open} onClose={handleClose} title={title} size="sm">
        <div className="grid gap-3">
          <Input
            label="Nombre *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={errors.name}
          />
          <ErrorMessage message={errors.name} />
          <Input
            label="Duración (minutos) *"
            type="number"
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
            error={errors.duration}
          />
          <ErrorMessage message={errors.duration} />
          <Button onClick={save} loading={saving}>Guardar</Button>
        </div>
      </Modal>
    </div>
  );
}
