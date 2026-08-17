import api from '@/plugins/api';

export const branchService = {
  list: (page: number) =>
    api.get(`/admin/branches?page=${page}`),

  create: (data: Record<string, unknown>, signal?: AbortSignal) =>
    api.post('/admin/branches', data, { signal }),

  toggleState: (id: number, state: string) =>
    api.post('/admin/branches/state', { id, state }),
};
