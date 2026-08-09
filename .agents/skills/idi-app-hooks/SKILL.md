---
name: idi-app-hooks
description: Reusable hooks catalogue for the idi_app Expo/React Native project. Use this skill when creating forms, paginated tables, modal dialogs, auth context, alerts, or toggle switches in idi_app. Provides exact signatures, return types, and usage patterns for all 6 project-specific hooks.
metadata:
  version: "1.0.0"
---

# idi_app Hooks

Catálogo de hooks reutilizables del proyecto idi_app — `idi_app/hook/`.

## Regla general

Antes de implementar un formulario, tabla paginada, diálogo modal, toggle de estado o manejo de alertas en idi_app, verificar si alguno de estos hooks cubre el caso. Todos los hooks están en `@/hook/` (alias `@` mapea a la raíz del proyecto).

---

## usePaginator
**Archivo:** `hook/usePaginator.ts`
**Import:** `import { usePaginator } from '@/hook/usePaginator'`

```ts
function usePaginator<T, F>(
  apiCall: (params: F & { page: number }) => Promise<PaginatedResponse<T>>,
  initialFilters: F
): {
  items: T[]
  setItems: Dispatch<SetStateAction<T[]>>
  paginator: PaginatedResponse<T> | null
  filters: F
  setFilters: Dispatch<SetStateAction<F>>
  page: number
  setPage: Dispatch<SetStateAction<number>>
  loading: boolean
  refresh: () => void
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  handleFilter: (e?: FormEvent) => void
  updateLocalItem: (id: number | string, updatedFields: Partial<T>, key?: keyof T) => void
}
```

**Cuándo usarlo:** Tablas con paginación desde API, filtros de búsqueda, actualizaciones locales optimistas (switches).
**Comportamiento:** `handleFilter` resetea a página 1 y dispara fetch. `updateLocalItem` modifica el estado local sin llamar a la API. `refresh` recarga la página actual.

---

## useAsyncFormHandler
**Archivo:** `hook/useAsyncFormHandler.ts`
**Import:** `import { useAsyncFormHandler } from '@/hook/useAsyncFormHandler'`

```ts
function useAsyncFormHandler(): {
  isLoading: boolean
  alertMessage: string | null
  alertSeverity: AlertSeverity
  Severity: AlertSeverity
  execute: <T>(
    asyncFunction: (signal: AbortSignal) => Promise<T>,
    successMessage?: string,
    errorMessage?: string
  ) => Promise<{ response: T | undefined; message: string; alertSeverity: AlertSeverity }>
  clearAlert: () => void
}
```

**Cuándo usarlo:** Envíos de formularios (POST/PUT/DELETE). Centraliza estados de carga, errores de Axios, timeout (31s), y normalización de mensajes de Laravel (422, 500, network).
**Importante:** La función que se pasa a `execute` recibe un `AbortSignal` y debe pasarlo a la llamada Axios. Ejemplo correcto: `await execute((signal) => axios.post(url, data, { signal }), "Guardado")`. En caso de error, muestra un `Toast.show` automáticamente.

---

## useDialogHandler
**Archivo:** `hook/useDialogHandler.ts`
**Import:** `import useDialogHandler from '@/hook/useDialogHandler'`

```ts
function useDialogHandler(names: DialogNames): {
  open: boolean
  title: string
  id: number
  handleOpen: (editId?: number) => void
  handleClose: () => void
}

interface DialogNames {
  create: string
  edit?: string
}
```

**Cuándo usarlo:** Diálogos modales que alternan entre crear/editar. `handleOpen()` sin args = modo creación (id=0, título create). `handleOpen(5)` = modo edición (id=5, título edit). `handleClose` espera 300ms antes de resetear id (animación de salida).

---

## useAuth
**Archivo:** `hook/useAuth.ts`
**Import:** `import { useAuth } from '@/hook/useAuth'`

```ts
function useAuth(): AuthContextType {
  user: User | undefined
  loading: boolean
  setUser: (u: User | undefined) => void
}
```

**Cuándo usarlo:** Acceder al usuario autenticado y estado de carga de sesión. Lanza error si se usa fuera de `AuthProvider`. El provider se define en otro archivo.

---

## useAlert
**Archivo:** `hook/useAlert.ts`
**Import:** `import useAlert from '@/hook/useAlert'`

```ts
function useAlert(): {
  alert: IAlert
  showAlert: (message: string, severity?: AlertSeverity) => void
  hideAlert: () => void
}

interface IAlert {
  message: string
  severity: AlertSeverity
  open: boolean
}

type AlertSeverity = 'success' | 'error' | 'info' | 'warning'
```

**Cuándo usarlo:** Notificaciones simples con estado de visibilidad. `showAlert("texto", "success")` abre; `hideAlert()` cierra sin limpiar el mensaje.

---

## useStatusToggle
**Archivo:** `hook/useStatusToggle.ts`
**Import:** `import { useStatusToggle } from '@/hook/useStatusToggle'`

```ts
function useStatusToggle<T extends Identifiable>(options: ToggleOptions<T>): {
  handleChangeActive: (event: ChangeEvent<HTMLInputElement>, item: T, limit?: number | null, length?: number | null) => Promise<void>
}

interface ToggleOptions<T> {
  setItems: Dispatch<SetStateAction<T[]>>
  apiCall: (newValue: boolean, id: number) => Promise<AxiosResponse<T>>
  refresh: () => void
  fieldName?: keyof T  // default: "is_active"
}

interface Identifiable { id: number }
```

**Cuándo usarlo:** Switches/checkboxes con persistencia optimista en API. Cambia el valor local inmediatamente; si la API falla, revierte al valor original. Soporta límite máximo de elementos activos (`limit`/`length`). Después de éxito llama a `refresh()`.

---

## Dependencias compartidas

- `AlertSeverity` en `@/types/AlertSeverity` = `'success' | 'error' | 'info' | 'warning'`
- `PaginatedResponse<T>` en `@/interfaces/PaginatedResponse` — tiene al menos `.data: T[]`
- Todos los hooks usan `useState`, `useCallback`, `useEffect` de React
- `useAsyncFormHandler` depende de `react-native-toast-message` para mostrar errores
