'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Paginator from '@/components/ui/Paginator';
import toast from 'react-hot-toast';
import { Shield, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface User { id: number; name: string; email: string; type_user: string; state: string; roles?: { id: number; name: string }[]; }
interface Role { id: number; name: string; }

export default function UsuariosPage() {
  const { loading } = useAuth('Administrator');
  const [items, setItems] = useState<User[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [rolesModal, setRolesModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [userRoles, setUserRoles] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  async function load(p = 1) {
    try {
      const { data } = await api.get(`/users?page=${p}`);
      setItems(data.data);
      setMeta(data.meta);
    } catch { toast.error('Error al cargar usuarios'); }
  }

  useEffect(() => { if (!loading) load(); }, [loading]);

  async function openRolesModal(u: User) {
    setSelectedUser(u);
    try {
      const [rolesRes, userRolesRes] = await Promise.all([
        api.get('/roles'),
        api.get(`/users/${u.id}/permissions`),
      ]);
      setAllRoles(rolesRes.data.data ?? rolesRes.data);
      setUserRoles(userRolesRes.data.roles?.map((r: any) => r.id ?? r) ?? []);
      setRolesModal(true);
    } catch { toast.error('Error al cargar datos'); }
  }

  function toggleRole(roleId: number) {
    setUserRoles(prev => prev.includes(roleId) ? prev.filter(x => x !== roleId) : [...prev, roleId]);
  }

  async function assignRoles() {
    if (!selectedUser) return;
    setSaving(true);
    try {
      await api.put(`/users/${selectedUser.id}/roles`, { roles: userRoles });
      toast.success('Roles actualizados');
      setRolesModal(false);
      load(page);
    } catch (e: any) { toast.error(e.response?.data?.message ?? 'Error'); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><span className="text-gray-400">Cargando...</span></div>;

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
        {meta && <div className="px-4"><Paginator meta={meta} onChange={(p) => { setPage(p); load(p); }} /></div>}
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
          <Button onClick={assignRoles} loading={saving} className="w-full justify-center mt-2">Guardar roles</Button>
        </div>
      </Modal>
    </div>
  );
}
