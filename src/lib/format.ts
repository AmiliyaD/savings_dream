export function formatCurrency(amount: number): string {
  const rounded = Math.round(amount);
  return `${rounded.toLocaleString('en-US')} ₽`;
}

export function formatCurrencySigned(amount: number): string {
  const rounded = Math.round(amount);
  const sign = rounded > 0 ? '+' : '';
  return `${sign}${rounded.toLocaleString('en-US')} ₽`;
}

export function formatDateLong(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function formatDayHeading(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function todayISO(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}
