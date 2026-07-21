<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Dr. Dentix Frontend

## Quick start

```bash
npm run dev      # dev server on :3000
npm run build    # production build
npm run start    # serve production build
```

No lint, typecheck, or test scripts exist.

## Project structure

- `src/app/` — App Router — role-based route groups: `admin/`, `dentist/`, `patient/`, `login/`
- `src/components/ui/` — Button, Input, Modal, Badge, Paginator, Toggle
- `src/components/layout/` — AdminNav (sidebar+topbar), PatientNav, Sidebar, Footer
- `src/lib/api.ts` — shared axios instance
- `src/lib/auth.ts` — cookie-based session (token + user JSON)
- `src/lib/utils.ts` — formatting helpers
- `src/hooks/useAuth.ts` — role-gated client component guard
- `@/*` alias maps to `./src/*` (tsconfig paths)

## Auth flow

- `NEXT_PUBLIC_API_URL` env var; default `http://localhost:8000/api`
- Patients login by document: POST `/auth/login/patient`
- Staff login by email+password: POST `/auth/login/staff`
- Session stored in cookies (`token`, `user`) via `setSession()`, expires 7 days
- Axios interceptor auto-attaches `Bearer` token and redirects to `/login` on 401
- Client guard: `useAuth(requiredRole?)` hook, redirects to `/login` if missing/unauthorized
- Public-only route: `/login`

## Routing

- `/` — reads cookie, redirects by `type_user`: Administrator → `/admin/citas`, Dentist → `/dentist/citas`, Patient → `/patient/citas`
- Admin routes have sidebar nav; Dentist/Patient routes have top nav only
- Admin nav: Citas, Pacientes, Odontólogos, Sedes, Procedimientos, Productos, Promociones, Reportes
- Dentist nav: Perfil, Citas, Horario
- Patient nav: Perfil, Agendar Cita, Citas

## Framework & style

- Next.js 16.2.10 + React 19.2.4, TypeScript strict mode
- Tailwind CSS v4 (`@import "tailwindcss"` not `@tailwind` directives) + `@tailwindcss/postcss`
- Brand CSS vars: `--navy: #013253`, `--sky: #00AFF1`, `--green: #7CB91D`, `--red: #FE0000`
- Semaforo classes: `.semaforo-verde`, `.semaforo-amarillo`, `.semaforo-rojo`
- Row state classes: `.row-pagado`, `.row-cancelado`
