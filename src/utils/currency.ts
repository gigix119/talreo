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
