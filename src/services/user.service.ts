import api from '@/plugins/api';

export const userService = {
  list: (page: number) =>
    api.get(`/users?page=${page}`),

  getPermissions: (id: number) =>
    api.get(`/users/${id}/permissions`),

  assignRoles: (id: number, roles: number[], signal?: AbortSignal) =>
    api.put(`/users/${id}/roles`, { roles }, { signal }),
};
