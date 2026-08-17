import api from '@/plugins/api';

export const branchService = {
  list: (page: number, params?: { name?: string; city?: string }) => {
    const query = new URLSearchParams({ page: String(page) });
    if (params?.name) query.set('name', params.name);
    if (params?.city) query.set('city', params.city);
    return api.get(`/admin/branches?${query.toString()}`);
  },

  create: (data: Record<string, unknown>, signal?: AbortSignal) =>
    api.post('/admin/branches', data, { signal }),

  toggleState: (id: number, state: string) =>
    api.post('/admin/branches/state', { id, state }),

  getSelect: () => api.get('/staff/branches/select'),

  getCities: () => api.get('/staff/branches/cities'),
};
