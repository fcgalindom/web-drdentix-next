import api from '@/plugins/api';

export const authService = {
  loginStaff: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  loginPatient: (document: string) =>
    api.post('/auth/login/patient', { document }),

  logout: () => api.post('/auth/logout'),

  uploadPhoto: (formData: FormData, signal?: AbortSignal) =>
    api.post('/auth/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      signal,
    }),

  registerPatient: (data: {
    name: string;
    document: string;
    telephone: string;
    birth?: string;
    city?: string;
    email?: string;
  }, signal?: AbortSignal) =>
    api.post('/admin/patients', data, { signal }),
};
