/**
 * recurringDetector — detect recurring transactions by note frequency.
 */
import type { Transaction } from '@/types/database';

const NORMALIZE_RE = /\s+/g;

export function normalizeNote(note: string | null): string {
  if (!note) return '';
  return note.toLowerCase().replace(NORMALIZE_RE, ' ').trim();
}

/**
 * Check if this transaction appears to be recurring (same note appears 2+ times in last 3 months).
 */
export function isRecurring(transaction: Transaction, allTransactions: Transaction[]): boolean {
  const n = normalizeNote(transaction.note);
  if (!n) return false;

  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 3);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  let count = 0;
  for (const t of allTransactions) {
    if (t.transaction_date >= cutoffStr && normalizeNote(t.note) === n) {
      count++;
      if (count >= 2) return true;
    }
  }
  return false;
}

/**
 * Memoized set of recurring transaction note hashes (for performance).
 */
export function getRecurringNoteSet(transactions: Transaction[]): Set<string> {
  const seen = new Map<string, number>();
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 3);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  for (const t of transactions) {
    const n = normalizeNote(t.note);
    if (!n) continue;
    if (t.transaction_date >= cutoffStr) {
      seen.set(n, (seen.get(n) ?? 0) + 1);
    }
  }

  const recurring = new Set<string>();
  for (const [note, count] of seen) {
    if (count >= 2) recurring.add(note);
  }
  return recurring;
}
