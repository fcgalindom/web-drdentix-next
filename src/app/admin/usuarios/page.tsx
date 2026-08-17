'use client';
import { useState } from 'react';
import { userService, roleService } from '@/services';
import { useAuth } from '@/hooks/useAuth';
import { usePaginator } from '@/hooks/usePaginator';
import { useAsyncFormHandler } from '@/hooks/useAsyncFormHandler';
import useAlert from '@/hooks/useAlert';
import AlertGeneric from '@/components/web/AlertGeneric';
import SpinnerLoad from '@/components/web/SpinnerLoad';
import Paginator from '@/components/web/Paginator';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Shield, Check, X } from 'lucide-react';
import type { PaginatedResponse } from '@/interfaces/index';
import { cn } from '@/lib/utils';

interface User { id: number; name: string; email: string; type_user: string; state: string; roles?: { id: number; name: string }[]; }
interface Role { id: number; name: string; }

const fetchUsers = async ({ page }: { page: number }): Promise<PaginatedResponse<User>> => {
  const { data } = await userService.list(page);
  return {
    data: data.data,
    current_page: data.meta.current_page,
    last_page: data.meta.last_page,
    total: data.meta.total,
    per_page: data.meta.per_page,
    from: data.meta.from,
    to: data.meta.to,
  };
};

export default function UsuariosPage() {
  const { loading: authLoading } = useAuth('Administrator');
  const { items, paginator, page, setPage, refresh } = usePaginator(fetchUsers, {});
  const { isLoading: saving, execute } = useAsyncFormHandler();
  const { alert, showAlert, hideAlert } = useAlert();
  const [rolesModal, setRolesModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [userRoles, setUserRoles] = useState<number[]>([]);

  async function openRolesModal(u: User) {
    setSelectedUser(u);
    try {
      const [rolesRes, userRolesRes] = await Promise.all([
        roleService.list(1),
        userService.getPermissions(u.id),
      ]);
      setAllRoles(rolesRes.data.data ?? rolesRes.data);
      setUserRoles(userRolesRes.data.roles?.map((r: any) => r.id ?? r) ?? []);
      setRolesModal(true);
    } catch { showAlert('Error al cargar datos', 'error'); }
  }

  function toggleRole(roleId: number) {
    setUserRoles(prev => prev.includes(roleId) ? prev.filter(x => x !== roleId) : [...prev, roleId]);
  }

  async function saveRoles() {
    if (!selectedUser) return;
    const result = await execute(
      () => userService.assignRoles(selectedUser.id, userRoles),
      'Roles actualizados'
    );
    if (result.response) {
      showAlert('Roles actualizados', 'success');
      setRolesModal(false);
      refresh();
    }
  }

  if (authLoading) return <SpinnerLoad />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#013253]">Usuarios</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#00AFF1] text-white">
            <tr>{['Nombre', 'Email', 'Tipo', 'Roles', 'Acciones'].map(h => (
              <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{u.type_user}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {u.roles?.length ? u.roles.map(r => (
                      <span key={r.id} className="text-xs bg-[#e1fea4] text-[#013253] px-2 py-0.5 rounded-full">{r.name}</span>
                    )) : <span className="text-xs text-gray-400">—</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => openRolesModal(u)}
                    className="p-1.5 text-[#7CB91D] hover:bg-green-50 rounded" title="Asignar roles">
                    <Shield size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Paginator paginator={paginator} page={page} setPage={setPage} />
      </div>

      <Modal open={rolesModal} onClose={() => setRolesModal(false)} title={`Roles: ${selectedUser?.name ?? ''}`} size="sm">
        <div className="flex flex-col gap-2">
          {allRoles.map((r) => {
            const active = userRoles.includes(r.id);
            return (
              <button key={r.id} onClick={() => toggleRole(r.id)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors border w-full text-left',
                  active ? 'bg-[#7CB91D]/10 border-[#7CB91D] text-[#013253]' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                )}>
                {active ? <Check size={16} className="text-[#7CB91D]" /> : <div className="w-4" />}
                {r.name}
              </button>
            );
          })}
          {allRoles.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No hay roles disponibles</p>}
          <Button onClick={saveRoles} loading={saving} className="w-full justify-center mt-2">Guardar roles</Button>
        </div>
      </Modal>

      <AlertGeneric severity={alert.severity} message={alert.message} open={alert.open} onClose={hideAlert} />
    </div>
  );
}
