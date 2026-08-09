---
name: idi-app-web-components
description: Reusable web components catalogue for the idi_app project (components/web/). Use this skill when building admin panels, paginated tables, modals, alerts, carousels, form inputs, or loading spinners in idi_app.
metadata:
  version: "1.0.0"
---

# idi_app Web Components

Catálogo de componentes reutilizables — `idi_app/components/web/`.

## Regla general

Antes de implementar un paginador, alerta, diálogo modal, spinner de carga, carrusel, sidebar o mensaje de error en idi_app, verificar si alguno de estos componentes cubre el caso. Import desde `@/components/web/`.

---

## Paginator
**Import:** `import { Paginator } from '@/components/web/Paginator'`
**Se conecta con:** `usePaginator`

```tsx
<Paginator<T>
  paginator={paginator}  // PaginatedResponse<T> | null
  page={page}            // number
  setPage={setPage}      // (value: number) => void
/>
```

**Props:**
- `paginator`: Objeto `PaginatedResponse<T>` (usa `.last_page` internamente)
- `page`: página actual (de `usePaginator().page`)
- `setPage`: setter de página (de `usePaginator().setPage`)

**Comportamiento:** Renderiza un `Pagination` de MUI con `variant="outlined"`, `color="primary"`, `shape="rounded"`.

---

## AlertGeneric
**Import:** `import AlertGeneric from '@/components/web/AlertGeneric'`
**Se conecta con:** `useAlert` o `useAsyncFormHandler`

```tsx
<AlertGeneric
  severity={'success' | 'error' | 'info' | 'warning'}
  message={alertMessage}  // string | null
  open={true}
  onClose={hideAlert}     // () => void
/>
```

**Comportamiento:** MUI `Snackbar` + `Alert` (`variant="filled"`), autoHideDuration de 3s, anclado top-center.

---

## ButtonAppoinment
**Import:** `import ButtonAppoinment from '@/components/web/ButtonAppoinment'`
**Se conecta con:** `useDialogHandler`, `useAsyncFormHandler`

```tsx
<ButtonAppoinment dataDashboard={dataDashboard} />
```

**Props:** `dataDashboard: DataDashboard` — debe tener `.typeAppoinments: { id, name }[]`

**Qué hace:** Botón "Agenda tu cita" que abre un `Dialog` MUI con formulario de agendamiento. Usa internamente:
- `useDialogHandler({ create: "Agenda tu cita", edit: "Edición de Recomendación" })`
- `useAsyncFormHandler().execute` para enviar el formulario
- `react-hook-form` + `zodResolver(scheduleAppoinment)`
- `ErrorMessage` para errores de validación
- `SpinnerLoad` durante el envío
- `sendEmailScheduleAppoinment` como servicio API

---

## CarrouselMultiple
**Import:** `import CarrouselMultiple from '@/components/web/CarrouselMultiple'`

```tsx
<CarrouselMultiple<T>
  items={data}
  perPage={3}
  perPageMd={2}
  perPageLg={3}
  timeAuto={4000}
  className="optional-class"
>
  {(item: T) => <Card data={item} />}
</CarrouselMultiple>
```

**Props:**
- `items: T[]` — datos a mostrar
- `perPage: number` — elementos visibles en desktop (>1092px)
- `perPageMd?: number` — elementos en tablet (576px-768px), default 1
- `perPageLg?: number` — elementos en laptop (768px-1092px)
- `timeAuto?: number` — ms entre slides automáticos, default 4000
- `className?: string` — clases CSS adicionales al inner
- `children: (item: T) => ReactNode` — render prop

**Comportamiento:** Carrusel infinito con clones, drag (mouse/touch), auto-play, botones prev/next. Breakpoints responsive. `isInfinite` se activa solo si `items.length > itemsPerSlide`.

---

## ErrorMessage
**Import:** `import ErrorMessage from '@/components/web/ErrorMessage'`

```tsx
<ErrorMessage message={errors.name?.message} />
```

**Props:** `message?: string` — si es falsy, retorna `null`. Si es string, renderiza `<span>` rojo con `fontSize: '.8em'`.

**Uso típico:** Debajo de cada `<TextField>` en formularios react-hook-form + zod.

---

## SpinnerLoad
**Import:** `import SpinnerLoad from '@/components/web/SpinnerLoad'`

```tsx
{isLoading && <SpinnerLoad />}
```

**Comportamiento:** MUI `Backdrop` con `open={true}` y `zIndex: drawer + 1`. Muestra logo `Logo.webp` con animación CSS `preloader-rotate-y`. Fondo semitransparente.

---

## AdminSidebar
**Import:** `import AdminSidebar from '@/components/web/AdminSidebar'`

```tsx
<AdminSidebar />
```

**Qué hace:** Layout completo con:
- MUI `AppBar` + `Drawer` (temporary, 240px width)
- Menú desde `constants/menu` (`Menu: MenuItem[]`) con soporte para submenús colapsables (`Collapse`)
- Navegación con `useNavigate()` de react-router-dom
- `FooterLago` al final del sidebar con datos de redes sociales y políticas de privacidad
- Llama a `getAllActive()` del servicio `socialMedia.service` en mount para obtener `socialMedias` y `privatePolicies`

**Nota:** Usa `<Outlet />` de react-router — está diseñado como layout route.

---

## Conexiones hooks ↔ componentes

| Hook | Componente que lo consume |
|------|--------------------------|
| `usePaginator` | `Paginator` (recibe `paginator`, `page`, `setPage`) |
| `useAlert` | `AlertGeneric` (recibe `severity`, `message`, `open`, `onClose`) |
| `useAsyncFormHandler` | `ButtonAppoinment` (usa `execute`, `isLoading`) |
| `useDialogHandler` | `ButtonAppoinment` (usa `open`, `title`, `handleOpen`, `handleClose`) |

**Patrón típico de formulario modal:**
```tsx
const { open, title, handleOpen, handleClose } = useDialogHandler({ create: "Título" })
const { execute, isLoading } = useAsyncFormHandler()
const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

// onSubmit: await execute(() => apiCall(data), "Éxito")
// UI: <Dialog> + <form> + <ErrorMessage> + {isLoading && <SpinnerLoad />}
```
