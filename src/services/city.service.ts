import api from '@/plugins/api';

export const cityService = {
  list: () => api.get('/cities'),
};
