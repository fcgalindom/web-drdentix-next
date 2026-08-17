import api from '@/plugins/api';

export const productService = {
  list: (page: number, params?: { active_principle?: string; semaphore?: string }) => {
    const query = new URLSearchParams({ page: String(page) });
    if (params?.active_principle) query.set('active_principle', params.active_principle);
    if (params?.semaphore) query.set('semaphore', params.semaphore);
    return api.get(`/admin/products?${query.toString()}`);
  },

  getActivePrinciples: () => api.get('/admin/products/active-principles'),

  create: (data: Record<string, unknown>, signal?: AbortSignal) =>
    api.post('/admin/products', data, { signal }),

  delete: (id: number) =>
    api.delete(`/admin/products/${id}`),
};
