'use client';
import { useState, useCallback } from 'react';
import api from '@/lib/api';
import { roleSchema, extractErrors } from '@/lib/schemas';
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
import Paginator from '@/components/web/Paginator';
import toast from 'react-hot-toast';
import { Plus, Pencil, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Role { id: number; name: string; guard_name: string; permissions_count?: number; }

export default function RolesPage() {
  const { loading: authLoading } = useAuth('Administrator');
  const router = useRouter();

  const fetchRoles = useCallback(async (params: { page: number }) => {
    const { data } = await api.get(`/roles?page=${params.page}`);
    return data;
  }, []);

  const { items, paginator, page, setPage, loading, refresh } = usePaginator<Role, {}>(fetchRoles, {});
  const { open, title, handleOpen, handleClose } = useDialogHandler({ create: 'Nuevo rol', edit: 'Editar rol' });
  const { execute, isLoading: saving } = useAsyncFormHandler();
  const { alert, showAlert, hideAlert } = useAlert();

  const [form, setForm] = useState({ id: 0, name: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const openCreate = () => {
    setForm({ id: 0, name: '' });
    setErrors({});
    handleOpen();
  };

  const openEdit = (r: Role) => {
    setForm({ id: r.id, name: r.name });
    setErrors({});
    handleOpen(r.id);
  };

  const save = async () => {
    const r = roleSchema.safeParse(form);
    if (!r.success) { setErrors(extractErrors(r.error)); return; }
    setErrors({});

    const { id, name } = form;
    const { alertSeverity: severity, message } = await execute(
      (signal) => id > 0
        ? api.put(`/roles/${id}`, { name }, { signal })
        : api.post('/roles', { name, guard_name: 'web' }, { signal }),
      id > 0 ? 'Rol actualizado' : 'Rol creado'
    );

    if (severity === 'success') {
      showAlert(message, 'success');
      handleClose();
      refresh();
    }
  };

  const remove = async (id: number, name: string) => {
    if (!confirm(`¿Eliminar el rol "${name}"?`)) return;
    try {
      await api.delete(`/roles/${id}`);
      toast.success('Rol eliminado');
      refresh();
    } catch { toast.error('Error al eliminar'); }
  };

  if (authLoading) return null;

  return (
    <div>
      {loading && <SpinnerLoad />}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#013253]">Roles</h1>
        <Button onClick={openCreate}><Plus size={16} /> Crear</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#00AFF1] text-white">
            <tr>{['Nombre', 'Permisos', 'Acciones'].map(h => (
              <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{r.name}</td>
                <td className="px-4 py-3 text-gray-600">{r.permissions_count ?? '—'}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => router.push(`/admin/roles/${r.id}`)}
                    className="p-1.5 text-[#7CB91D] hover:bg-green-50 rounded" title="Asignar permisos">
                    <Shield size={15} />
                  </button>
                  <button onClick={() => openEdit(r)}
                    className="p-1.5 text-[#013253] hover:bg-blue-50 rounded"><Pencil size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Paginator paginator={paginator} page={page} setPage={setPage} />
      </div>

      <Modal open={open} onClose={handleClose} title={title} size="sm">
        <div className="grid gap-3">
          <Input label="Nombre del rol *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />
          <ErrorMessage message={errors.name} />
          <Button onClick={save} loading={saving}>Guardar</Button>
        </div>
      </Modal>

      <AlertGeneric severity={alert.severity} message={alert.message} open={alert.open} onClose={hideAlert} />
    </div>
  );
}
