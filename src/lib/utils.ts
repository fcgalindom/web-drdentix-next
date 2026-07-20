export function parseCOP(value: number): string {
  return '$' + value.toLocaleString('es-CO');
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function stateColor(state: string): string {
  switch (state) {
    case 'Pagado':    return 'bg-green-100 text-green-800';
    case 'Activo':    return 'bg-blue-100 text-blue-800';
    case 'Recordado': return 'bg-yellow-100 text-yellow-800';
    case 'Cancelado': return 'bg-red-100 text-red-800';
    case 'No asistio': return 'bg-gray-100 text-gray-700';
    default:          return 'bg-gray-100 text-gray-700';
  }
}

export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
