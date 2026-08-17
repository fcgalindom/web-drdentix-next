import api from '@/plugins/api';

export const companyService = {
  list: (page: number) =>
    api.get(`/companies?page=${page}`),

  adminList: (page: number) =>
    api.get(`/admin/companies?page=${page}`),

  create: (data: Record<string, unknown>, signal?: AbortSignal) =>
    api.post('/companies', data, { signal }),

  adminCreate: (data: Record<string, unknown>, signal?: AbortSignal) =>
    api.post('/admin/companies', data, { signal }),

  delete: (id: number) =>
    api.delete(`/companies/${id}`),

  adminDelete: (id: number) =>
    api.delete(`/admin/companies/${id}`),
};