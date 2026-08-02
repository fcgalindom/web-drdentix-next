import Cookies from 'js-cookie';

export interface AuthUser {
  id: number;
  document: string;
  email: string | null;
  type_user: 'Administrator' | 'Dentist' | 'Patient';
  photo: string;
  state: string;
  company_id?: number;
  roles?: { id: number; name: string }[];
  permissions?: string[];
}

export function getUser(): AuthUser | null {
  try {
    const raw = Cookies.get('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSession(token: string, user: AuthUser) {
  Cookies.set('token', token, { expires: 7 });
  Cookies.set('user', JSON.stringify(user), { expires: 7 });
}

export function clearSession() {
  Cookies.remove('token');
  Cookies.remove('user');
}

export function isAdmin(user: AuthUser | null): boolean {
  return user?.type_user === 'Administrator';
}

export function isDentist(user: AuthUser | null): boolean {
  return user?.type_user === 'Dentist';
}

export function isPatient(user: AuthUser | null): boolean {
  return user?.type_user === 'Patient';
}
