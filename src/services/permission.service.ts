import api from '@/plugins/api';

export const permissionService = {
  list: () => api.get('/permissions'),

  create: (name: string, signal?: AbortSignal) =>
    api.post('/permissions', { name, guard_name: 'web' }, { signal }),

  update: (id: number, name: string, signal?: AbortSignal) =>
    api.put(`/permissions/${id}`, { name }, { signal }),
};
