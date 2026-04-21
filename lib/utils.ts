import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency: string) {
  const locale = currency === "BRL" ? "pt-BR" : currency === "EUR" ? "de-DE" : "en-US";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(0)}`;
  }
}

export function formatLocalEquivalent(
  value: number,
  rate: number,
  localCurrency: string,
  primaryCurrency: string,
): string | null {
  if (!localCurrency || !rate || !Number.isFinite(rate) || rate <= 0) return null;
  if (localCurrency.toUpperCase() === primaryCurrency.toUpperCase()) return null;
  return `≈ ${formatCurrency(value * rate, localCurrency)}`;
}
