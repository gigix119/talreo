/**
 * Currency formatting — uses user's profile currency and locale.
 */
import type { Currency } from '@/types/database';

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  PLN: 'zł',
  EUR: '€',
  USD: '$',
};

const LOCALE_MAP: Record<string, string> = { pl: 'pl-PL', en: 'en-US' };

export function formatAmount(amount: number, currency: Currency | string = 'PLN', locale: string = 'pl'): string {
  const l = LOCALE_MAP[locale] ?? 'pl-PL';
  const symbol = CURRENCY_SYMBOLS[currency as Currency] ?? String(currency);
  const formatted = new Intl.NumberFormat(l, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));
  return `${formatted} ${symbol}`;
}

export function formatAmountSigned(amount: number, currency: Currency = 'PLN', locale: string = 'pl'): string {
  const prefix = amount >= 0 ? '+' : '−';
  return `${prefix} ${formatAmount(amount, currency, locale)}`;
}

/** Compact format for chart axis (avoids clipped labels on mobile) */
export function formatAmountShort(amount: number, currency: Currency | string = 'PLN'): string {
  const symbol = CURRENCY_SYMBOLS[currency as Currency] ?? String(currency);
  const abs = Math.abs(amount);
  if (abs >= 1_000_000) return `${(abs / 1_000_000).toFixed(1)}M ${symbol}`;
  if (abs >= 1_000) return `${(abs / 1_000).toFixed(1)}k ${symbol}`;
  return new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 }).format(abs) + ' ' + symbol;
}
