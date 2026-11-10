import api from '@/plugins/api';

export const planService = {
  list: (page: number) =>
    api.get(`/admin/plans?page=${page}`),

  publicList: () =>
    api.get('/plans'),

  create: (data: Record<string, unknown>, signal?: AbortSignal) =>
    api.post('/admin/plans', data, { signal }),

  delete: (id: number) =>
    api.delete(`/admin/plans/${id}`),
};