/**
 * Format amounts for Polish insight text (e.g. "58 zł", "2550 zł").
 */
import type { Currency } from '@/types/database';

const SYMBOL: Record<Currency, string> = {
  PLN: 'zł',
  EUR: '€',
  USD: '$',
};

/**
 * Format amount for display in insight text. No decimals for whole numbers.
 */
export function formatAmountForInsight(amount: number, currency: Currency): string {
  const sym = SYMBOL[currency];
  const abs = Math.abs(amount);
  const formatted =
    abs % 1 === 0
      ? Math.round(abs).toLocaleString('pl-PL')
      : abs.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${formatted} ${sym}`;
}
