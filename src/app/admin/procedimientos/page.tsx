'use client';
import { useState, useEffect } from 'react';
import { procedureService } from '@/services';
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
import AppSelect from '@/components/ui/AppSelect';
import { Plus, Pencil } from 'lucide-react';
import type { PaginatedResponse } from '@/interfaces/index';

interface Procedure { id: number; name: string; duration: number; state: string; }
interface Filters { name: string; duration: string; }

export default function ProcedimientosPage() {
  const { loading: authLoading } = useAuth('Administrator');
  const { alert, showAlert, hideAlert } = useAlert();

  const [nameOptions, setNameOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    if (!authLoading) {
      procedureService.getSelect().then(({ data }) => {
        setNameOptions([
          { value: '', label: 'Todos' },
          ...data.map((p: any) => ({ value: p.name, label: p.name })),
        ]);
      });
    }
  }, [authLoading]);

  const DURATION_OPTIONS = [
    { value: '', label: 'Todas' },
    { value: '30', label: '30 min' },
    { value: '45', label: '45 min' },
    { value: '60', label: '60 min' },
    { value: '90', label: '90 min' },
    { value: '120', label: '120 min' },
  ];

  const initialFilters: Filters = { name: '', duration: '' };

  const {
    items, setItems, paginator, page, setPage, loading, refresh, filters, handleChange, handleFilter,
  } = usePaginator<Procedure, Filters>(
    async (params) => {
      const { data } = await procedureService.list(params.page, { name: params.name, duration: params.duration });
      return data as PaginatedResponse<Procedure>;
    },
    initialFilters
  );

  const { open, title, handleOpen, handleClose } = useDialogHandler({
    create: 'Nuevo procedimiento',
    edit: 'Editar procedimiento',
  });

  const { isLoading: saving, execute } = useAsyncFormHandler();

  const { handleChangeActive } = useStatusToggle<Procedure>({
    setItems,
    apiCall: async (newValue, id) => {
      return procedureService.toggleState(id, newValue ? 'Activo' : 'Inactivo');
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
        return procedureService.create(payload);
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

      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1 min-w-[220px]">
          <label className="text-sm font-medium text-gray-700">Procedimiento</label>
          <AppSelect
            options={nameOptions}
            value={filters.name}
            onChange={(val) => handleChange({ target: { name: 'name', value: val } } as any)}
            placeholder="Todos"
          />
        </div>
        <div className="flex flex-col gap-1 min-w-[160px]">
          <label className="text-sm font-medium text-gray-700">Duración</label>
          <AppSelect
            options={DURATION_OPTIONS}
            value={filters.duration}
            onChange={(val) => handleChange({ target: { name: 'duration', value: val } } as any)}
            placeholder="Todas"
          />
        </div>
        <Button onClick={handleFilter}>Buscar</Button>
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
