import api from '@/plugins/api';

export const promotionService = {
  list: (page: number) =>
    api.get(`/admin/promotions?page=${page}`),

  create: (data: Record<string, unknown>, signal?: AbortSignal) =>
    api.post('/admin/promotions', data, { signal }),

  deactivate: (id: number) =>
    api.post('/admin/promotions/deactivate', { id }),
};
