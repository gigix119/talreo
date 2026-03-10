/**
 * transactionParser — quick add: parse "uber 34", "lidl 120" to amount, category, note.
 */
import { suggestCategory } from './categorySuggestion';
import type { TransactionType } from '@/types/database';

export interface ParsedTransaction {
  amount: number;
  note: string;
  categoryName: string | null;
  type: TransactionType;
}

const AMOUNT_RE = /(\d+(?:[.,]\d{1,2})?)\s*$/;

/**
 * Parse quick add string like "uber 34", "lidl 120", "netflix 29".
 * Returns amount, note (capitalized keyword), suggested category.
 * Amount is always positive; type defaults to expense.
 */
export function parseQuickAdd(text: string): ParsedTransaction | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const amountMatch = trimmed.match(AMOUNT_RE);
  if (!amountMatch) return null;

  const amountStr = amountMatch[1].replace(',', '.');
  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) return null;

  const keywordPart = trimmed.slice(0, amountMatch.index).trim();
  const note = keywordPart
    ? keywordPart
        .split(/\s+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ')
    : '';

  const suggestion = note ? suggestCategory(note) : null;
  return {
    amount,
    note: note || 'Quick add',
    categoryName: suggestion?.categoryName ?? null,
    type: suggestion?.type ?? 'expense',
  };
}
