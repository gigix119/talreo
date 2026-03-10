/**
 * Transaction display utilities — strip recurring prefix, format for UI.
 */

/** Remove [recurring:uuid] prefix from note. Never show technical IDs to users. */
export function formatTransactionNote(note: string | null): string {
  if (!note) return '';
  return note.replace(/\[recurring:[^\]]+\]\s*/g, '').trim();
}

/** Get display title: formatted note or category name. */
export function getTransactionTitle(note: string | null, categoryName: string): string {
  const clean = formatTransactionNote(note);
  if (clean) return clean;
  return categoryName || '—';
}
