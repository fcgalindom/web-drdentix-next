'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { roleService, permissionService } from '@/services';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { ArrowLeft, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Permission { id: number; name: string; guard_name: string; }

export default function RoleDetailPage() {
  const { loading } = useAuth('Administrator');
  const router = useRouter();
  const { id } = useParams();
  const roleId = Number(id);
  const [role, setRole] = useState<any>(null);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const [roleRes, permsRes] = await Promise.all([
        roleService.getPermissions(roleId),
        permissionService.list(),
      ]);
      setRole(roleRes.data);
      setAllPermissions(permsRes.data);
      setSelected(roleRes.data.permissions?.map((p: any) => p.id ?? p) ?? []);
    } catch { toast.error('Error al cargar'); }
  }

  useEffect(() => { if (!loading) load(); }, [loading]);

  function togglePerm(permId: number) {
    setSelected(prev => prev.includes(permId) ? prev.filter(x => x !== permId) : [...prev, permId]);
  }

  async function syncPermissions() {
    setSaving(true);
    try {
      await roleService.syncPermissions(roleId, selected);
      toast.success('Permisos actualizados');
    } catch (e: any) { toast.error(e.response?.data?.message ?? 'Error'); }
    finally { setSaving(false); }
  }

  if (loading || !role) return null;

  const grouped = allPermissions.reduce((acc: Record<string, Permission[]>, p) => {
    const group = p.name.split('.')[0] ?? 'general';
    if (!acc[group]) acc[group] = [];
    acc[group].push(p);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#013253]">{role.name}</h1>
          <p className="text-sm text-gray-500">Asignación de permisos</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[#013253]">Permisos disponibles</h2>
          <Button onClick={syncPermissions} loading={saving}>
            <Check size={16} /> Guardar permisos
          </Button>
        </div>

        <div className="space-y-4">
          {Object.entries(grouped).map(([group, perms]) => (
            <div key={group}>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">{group}</h3>
              <div className="flex flex-wrap gap-2">
                {perms.map((p) => {
                  const active = selected.includes(p.id);
                  return (
                    <button key={p.id} onClick={() => togglePerm(p.id)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border',
                        active
                          ? 'bg-[#7CB91D]/10 border-[#7CB91D] text-[#013253]'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      )}>
                      {active ? <Check size={14} /> : <X size={14} className="opacity-0" />}
                      {p.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
