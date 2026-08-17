import api from '@/plugins/api';

export const procedureService = {
  list: (page: number, params?: { name?: string; duration?: string }) => {
    const query = new URLSearchParams({ page: String(page) });
    if (params?.name) query.set('name', params.name);
    if (params?.duration) query.set('duration', params.duration);
    return api.get(`/admin/procedures?${query.toString()}`);
  },

  create: (data: Record<string, unknown>, signal?: AbortSignal) =>
    api.post('/admin/procedures', data, { signal }),

  toggleState: (id: number, state: string) =>
    api.post('/admin/procedures/state', { id, state }),

  getSelect: () => api.get('/staff/procedures/select'),
};
