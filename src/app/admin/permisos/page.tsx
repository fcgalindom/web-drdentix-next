'use client';
import { useEffect, useState } from 'react';
import { permissionService } from '@/services';
import { permissionSchema, extractErrors } from '@/lib/schemas';
import { useAuth } from '@/hooks/useAuth';
import { useAsyncFormHandler } from '@/hooks/useAsyncFormHandler';
import { useDialogHandler } from '@/hooks/useDialogHandler';
import { useAlert } from '@/hooks/useAlert';
import SpinnerLoad from '@/components/web/SpinnerLoad';
import ErrorMessage from '@/components/web/ErrorMessage';
import AlertGeneric from '@/components/web/AlertGeneric';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface Permission { id: number; name: string; guard_name: string; }

export default function PermisosPage() {
  const { loading } = useAuth('Administrator');
  const { execute, isLoading: saving } = useAsyncFormHandler();
  const { open, title, handleOpen, handleClose } = useDialogHandler({ create: 'Nuevo permiso', edit: 'Editar permiso' });
  const { alert, showAlert, hideAlert } = useAlert();
  const [items, setItems] = useState<Permission[]>([]);
  const [form, setForm] = useState({ id: 0, name: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function load() {
    try {
      const { data } = await permissionService.list();
      setItems(data);
    } catch { toast.error('Error al cargar permisos'); }
  }

  useEffect(() => { if (!loading) load(); }, [loading]);

  async function save() {
    const r = permissionSchema.safeParse(form);
    if (!r.success) { setErrors(extractErrors(r.error)); return; }
    setErrors({});

    const { id, name } = form;
    const { response, message, alertSeverity } = await execute(async (_signal) => {
      if (id) {
        return await permissionService.update(id, name);
      } else {
        return await permissionService.create(name);
      }
    }, id ? 'Permiso actualizado' : 'Permiso creado');

    if (response) {
      showAlert(message, alertSeverity);
      handleClose();
      load();
    }
  }

  if (loading) return <SpinnerLoad />;

  return (
    <div>
      <AlertGeneric severity={alert.severity} message={alert.message} open={alert.open} onClose={hideAlert} />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#013253]">Permisos</h1>
        <Button onClick={() => { setForm({ id: 0, name: '' }); setErrors({}); handleOpen(); }}>
          <Plus size={16} /> Crear
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#00AFF1] text-white">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Nombre</th>
              <th className="px-4 py-3 text-left font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium font-mono text-xs">{p.name}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => { setForm({ id: p.id, name: p.name }); setErrors({}); handleOpen(p.id); }}
                    className="p-1.5 text-[#013253] hover:bg-blue-50 rounded"><Pencil size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={handleClose} title={title} size="sm">
        <div className="grid gap-3">
          <Input label="Nombre del permiso *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ej: citas.crear" />
          <ErrorMessage message={errors.name} />
          <Button onClick={save} loading={saving}>Guardar</Button>
        </div>
      </Modal>
    </div>
  );
}
