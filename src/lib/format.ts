export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

export function parseCurrencyInput(value: string): number {
  const normalized = value.trim().replace(/\s+/g, "");

  if (!normalized) {
    return Number.NaN;
  }

  const usesCommaAsDecimal =
    normalized.includes(",") &&
    (!normalized.includes(".") || normalized.lastIndexOf(",") > normalized.lastIndexOf("."));

  const sanitized = usesCommaAsDecimal
    ? normalized.replaceAll(".", "").replace(",", ".")
    : normalized.replaceAll(",", "");

  return Number(sanitized);
}

export function formatShortDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(`${value}T00:00:00`));
}

export function formatMonthLabel(value: string): string {
  const [year, month] = value.split("-");
  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    year: "2-digit"
  }).format(new Date(Number(year), Number(month) - 1, 1));
}
