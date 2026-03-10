/**
 * categorySuggestion — keyword-based category detection.
 * Returns suggested category name and type for a given note/title.
 */
import type { TransactionType } from '@/types/database';

export interface CategorySuggestion {
  categoryName: string;
  type: TransactionType;
}

/** Keywords (lowercase) → suggested category name and type */
const KEYWORD_MAP: Array<{ keywords: string[]; categoryName: string; type: TransactionType }> = [
  { keywords: ['netflix', 'spotify', 'hbo', 'disney', 'youtube premium', 'apple music', 'amazon prime', 'deezer'], categoryName: 'Subscriptions', type: 'expense' },
  { keywords: ['uber', 'bolt', 'taxi', 'lyft', 'free now'], categoryName: 'Transport', type: 'expense' },
  { keywords: ['shell', 'orlen', 'bp', 'fuel', 'benzyna', 'tankowanie', 'paliwo'], categoryName: 'Transport', type: 'expense' },
  { keywords: ['biedronka', 'lidl', 'kaufland', 'tesco', 'carrefour', 'grocery', 'żabka', 'zabka'], categoryName: 'Food', type: 'expense' },
  { keywords: ['salary', 'wynagrodzenie', 'pensja', 'payroll'], categoryName: 'Salary', type: 'income' },
  { keywords: ['freelance', 'faktura', 'invoice'], categoryName: 'Freelance', type: 'income' },
  { keywords: ['rent', 'czynsz', 'mortgage', 'hipoteka'], categoryName: 'Bills', type: 'expense' },
  { keywords: ['entertainment', 'rozrywka', 'kino', 'cinema'], categoryName: 'Entertainment', type: 'expense' },
];

/** Known subscription service names (for Subscription tag) */
export const SUBSCRIPTION_KEYWORDS = new Set([
  'netflix', 'spotify', 'hbo', 'disney', 'youtube premium', 'apple music', 'amazon prime', 'deezer',
  'hbo max', 'disney+', 'prime video', 'canva', 'notion', 'dropbox', 'icloud', 'google one',
]);

const NORMALIZE_RE = /\s+/g;

function normalize(text: string): string {
  return text.toLowerCase().replace(NORMALIZE_RE, ' ').trim();
}

/**
 * Suggest category from note/title. Returns first match.
 * User can override manually.
 */
export function suggestCategory(note: string): CategorySuggestion | null {
  const n = normalize(note);
  if (!n) return null;
  const words = n.split(/\s+/);
  for (const { keywords, categoryName, type } of KEYWORD_MAP) {
    for (const kw of keywords) {
      if (n.includes(kw) || words.some((w) => w.includes(kw) || kw.includes(w))) {
        return { categoryName, type };
      }
    }
  }
  return null;
}

/**
 * Check if note matches known subscription services.
 */
export function isSubscription(note: string): boolean {
  const n = normalize(note);
  if (!n) return false;
  return Array.from(SUBSCRIPTION_KEYWORDS).some((kw) => n.includes(kw));
}
