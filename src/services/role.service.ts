import api from '@/plugins/api';

export const roleService = {
  list: (page: number) =>
    api.get(`/roles?page=${page}`),

  create: (name: string, signal?: AbortSignal) =>
    api.post('/roles', { name, guard_name: 'web' }, { signal }),

  update: (id: number, name: string, signal?: AbortSignal) =>
    api.put(`/roles/${id}`, { name }, { signal }),

  delete: (id: number) =>
    api.delete(`/roles/${id}`),

  getPermissions: (id: number) =>
    api.get(`/roles/${id}/permissions`),

  syncPermissions: (id: number, permissions: number[], signal?: AbortSignal) =>
    api.put(`/roles/${id}/permissions`, { permissions }, { signal }),
};
