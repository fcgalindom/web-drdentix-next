<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Dr. Dentix Frontend

## Commands

```bash
npm run dev      # dev :3000
npm run build    # production build
npm run start    # serve production build
```

npm only (package-lock.json). No lint, typecheck, or test scripts.

## Architecture

- `src/app/` — App Router, role-based: `admin/`, `dentist/`, `patient/`, `login/`
- **All pages are `'use client'`** — no Server Components except layouts.
- `PatientNav` is shared between `/dentist/*` and `/patient/*` layouts (switches links by `type_user`).
- `@/*` → `./src/*`

## Auth

- `NEXT_PUBLIC_API_URL` (default `http://localhost:8000/api`), not committed in `.env*`.
- Login: `POST /auth/login` (staff, email+password) or `/auth/login/patient` (document).
- Login response returns `{ token, user }` where `user` includes `company_id`.
- Session: `setSession(token, user)` → cookies, 7-day expiry.
- Axios interceptor (`src/plugins/api.ts`) attaches `Bearer`; on 401 removes cookies but **does not redirect** to `/login` — there is no redirect in the interceptor.
- `useAuth(requiredRole?)` guard — no user or wrong role → `router.replace('/login')`.
- `AuthUser` interface: `{ id, document, email, type_user, photo, state, company_id?, roles?, permissions? }`.
- Public only: `/login`. Root `/` redirects by `type_user` cookie.

## Routes

- Admin: Citas, Pacientes, Odontólogos, Sedes, Procedimientos, Productos, Promociones, Reportes (stub), **Usuarios, Roles, Permisos**
- Dentist: Perfil, Citas, Horario
- Patient: Perfil, Agendar Cita, Citas
- `/patient/citas/[id]/factura` is linked but **does not exist** (404)

### Roles & Permissions

- `GET /roles` / `POST /roles` / `PUT /roles/{id}` / `DELETE /roles/{id}` — CRUD
- `PUT /roles/{id}/permissions` — sync role permissions
- `GET /permissions` / `POST /permissions` / `PUT /permissions/{id}` — CRUD
- `GET /users` / `GET /users/{id}/permissions` / `PUT /users/{id}/roles` — user-role assignment

## Framework & style

- Next.js 16.2.10 + React 19.2.4, TypeScript strict.
- Tailwind v4: `@import "tailwindcss"` (not `@tailwind`), **no `tailwind.config`** — all customization via CSS vars in `globals.css`.
- Brand: `--navy: #013253`, `--sky: #00AFF1`, `--green: #7CB91D`, `--red: #FE0000`. Inline arbitrary values (`text-[#013253]`) used instead of CSS var references.
- `cn()` is `classes.filter(Boolean).join(' ')` — not `clsx`/`tailwind-merge`.
- Photo URLs: `NEXT_PUBLIC_API_URL.replace('/api', '')` + path.
- No loading states — all CRUD pages return `null` while loading, no error boundaries.
- `company_id` is auto-assigned by the backend from the authenticated user — do **not** send it in requests.
