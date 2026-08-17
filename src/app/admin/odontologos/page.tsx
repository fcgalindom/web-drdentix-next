'use client';
import { useEffect, useState } from 'react';
import { dentistService, procedureService } from '@/services';
import { dentistSchema, extractErrors } from '@/lib/schemas';
import { useAuth } from '@/hooks/useAuth';
import { usePaginator } from '@/hooks/usePaginator';
import { useDialogHandler } from '@/hooks/useDialogHandler';
import { useAsyncFormHandler } from '@/hooks/useAsyncFormHandler';
import { useStatusToggle } from '@/hooks/useStatusToggle';
import { useAlert } from '@/hooks/useAlert';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Paginator from '@/components/web/Paginator';
import Toggle from '@/components/ui/Toggle';
import SpinnerLoad from '@/components/web/SpinnerLoad';
import ErrorMessage from '@/components/web/ErrorMessage';
import AlertGeneric from '@/components/web/AlertGeneric';
import { Plus, Pencil, CalendarDays, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { PaginatedResponse } from '@/interfaces/index';

interface Dentist { id: number; name: string; city: string; user: { document: string; email: string; state: string }; procedures: { id: number; name: string }[]; }
interface Procedure { id: number; name: string; duration: number; }

const empty = { id: 0, name: '', city: '', document: '', email: '', birth: '', password: '', procedure_ids: [] as number[] };

export default function OdontologosPage() {
  const { loading } = useAuth('Administrator');
  const router = useRouter();

  const [procedures, setProcedures] = useState<Procedure[]>([]);

  const initialFilters = { name: '', document: '', city: '' };

  const {
    items, setItems, paginator, filters, page, setPage,
    loading: loadingList, refresh, handleChange, handleFilter
  } = usePaginator<Dentist, typeof initialFilters>(
    async (params) => {
      const { data } = await dentistService.list({ page: params.page, name: params.name, document: params.document, city: params.city });
      return data as PaginatedResponse<Dentist>;
    },
    initialFilters
  );

  useEffect(() => {
    if (!loading) {
      procedureService.getSelect().then(res => setProcedures(res.data));
    }
  }, [loading]);

  const { open, title, id: editId, handleOpen, handleClose } = useDialogHandler({
    create: 'Nuevo odontólogo',
    edit: 'Editar odontólogo'
  });

  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (editId) {
        const d = items.find(i => i.id === editId);
        if (d) {
          setForm({
            id: d.id, name: d.name, city: d.city,
            document: d.user.document, email: d.user.email ?? '',
            birth: '', password: '',
            procedure_ids: d.procedures.map(p => p.id)
          });
        }
      } else {
        setForm(empty);
      }
      setErrors({});
    }
  }, [open, editId, items]);

  const { isLoading: saving, execute } = useAsyncFormHandler();
  const { alert, showAlert, hideAlert } = useAlert();

  function addProcedure(id: number) {
    if (!form.procedure_ids.includes(id)) setForm(f => ({ ...f, procedure_ids: [...f.procedure_ids, id] }));
  }
  function removeProcedure(id: number) {
    setForm(f => ({ ...f, procedure_ids: f.procedure_ids.filter(x => x !== id) }));
  }

  const { handleChangeActive } = useStatusToggle<Dentist>({
    setItems,
    apiCall: async (newValue, id) => {
      const state = newValue ? 'Activo' : 'Inactivo';
      return dentistService.toggleState(id, state);
    },
    refresh,
    fieldName: 'is_active' as any,
  });

  async function save() {
    if (!form.id) {
      if (!form.password) {
        setErrors({ password: 'La contraseña es requerida' });
        return;
      }
    }
    const r = dentistSchema.safeParse(form);
    if (!r.success) {
      setErrors(extractErrors(r.error));
      return;
    }
    setErrors({});

    const result = await execute(async (_signal) => {
      const { id, ...rest } = form;
      const payload: any = { ...rest };
      if (id) payload.id = id;
      return dentistService.create(payload, _signal);
    });

    if (result.alertSeverity === 'success') {
      showAlert(result.message, 'success');
      handleClose();
      refresh();
    }
  }

  if (loading) return null;
  if (loadingList) return <SpinnerLoad />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#0F172A]">Odontólogos</h1>
        <Button onClick={() => handleOpen()}><Plus size={16} /> Crear</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-end">
        <Input label="Nombre" name="name" value={filters.name} onChange={handleChange} />
        <Input label="Cédula" name="document" value={filters.document} onChange={handleChange} />
        <Input label="Ciudad" name="city" value={filters.city} onChange={handleChange} />
        <Button onClick={handleFilter}>Buscar</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#0EA5E9] text-white">
            <tr>{['Nombre', 'Cédula', 'Email', 'Ciudad', 'Procedimientos', 'Estado', 'Acciones'].map(h => (
              <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {items.map((d) => (
              <tr key={d.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{d.name}</td>
                <td className="px-4 py-3 text-gray-600">{d.user?.document}</td>
                <td className="px-4 py-3 text-gray-600">{d.user?.email ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{d.city}</td>
                <td className="px-4 py-3 text-gray-600">{d.procedures?.length ?? 0}</td>
                <td className="px-4 py-3">
                  <Toggle active={d.user?.state === 'Activo'} onToggle={() => {
                    handleChangeActive({ target: { checked: d.user?.state !== 'Activo' } } as any, d);
                  }} />
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => handleOpen(d.id)} className="p-1.5 text-[#0F172A] hover:bg-blue-50 rounded"><Pencil size={15} /></button>
                  <button onClick={() => router.push(`/admin/odontologos/${d.id}/horario`)} className="p-1.5 text-[#0369A1] hover:bg-green-50 rounded"><CalendarDays size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4">
          <Paginator paginator={paginator} page={page} setPage={setPage} />
        </div>
      </div>

      <Modal open={open} onClose={handleClose} title={title} size="xl">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Input label="Nombre *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />
            <ErrorMessage message={errors.name} />
          </div>
          <div>
            <Input label="Ciudad *" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} error={errors.city} />
            <ErrorMessage message={errors.city} />
          </div>
          <div>
            <Input label="Cédula *" value={form.document} onChange={(e) => setForm({ ...form, document: e.target.value })} error={errors.document} />
            <ErrorMessage message={errors.document} />
          </div>
          <div>
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} />
            <ErrorMessage message={errors.email} />
          </div>
          <Input label="Fecha de nacimiento" type="date" value={form.birth} onChange={(e) => setForm({ ...form, birth: e.target.value })} />
          {!form.id && (
            <div>
              <Input label="Contraseña *" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} error={errors.password} />
              <ErrorMessage message={errors.password} />
            </div>
          )}
          <div className="col-span-2">
            <label className="text-sm font-medium text-gray-700 block mb-1">Procedimientos</label>
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" onChange={(e) => addProcedure(Number(e.target.value))}>
              <option value="">Seleccionar procedimiento</option>
              {procedures.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <div className="flex flex-wrap gap-2 mt-2">
              {form.procedure_ids.map((id: number) => {
                const p = procedures.find(x => x.id === id);
                return p ? (
                  <span key={id} className="flex items-center gap-1 bg-[#e1fea4] text-[#0F172A] text-xs px-2 py-1 rounded-full">
                    {p.name}
                    <button onClick={() => removeProcedure(id)}><X size={12} /></button>
                  </span>
                ) : null;
              })}
            </div>
          </div>
          <div className="col-span-2"><Button onClick={save} loading={saving} className="w-full justify-center">Guardar</Button></div>
        </div>
      </Modal>

      <AlertGeneric severity={alert.severity} message={alert.message} open={alert.open} onClose={hideAlert} />
    </div>
  );
}
