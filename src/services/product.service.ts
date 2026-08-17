import api from '@/plugins/api';

export const productService = {
  list: (page: number) =>
    api.get(`/admin/products?page=${page}`),

  create: (data: Record<string, unknown>, signal?: AbortSignal) =>
    api.post('/admin/products', data, { signal }),

  delete: (id: number) =>
    api.delete(`/admin/products/${id}`),
};
