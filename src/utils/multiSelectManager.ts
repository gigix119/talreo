/**
 * multiSelectManager — selection state helpers for multi-select mode.
 * Use with useMultiSelectManager hook.
 */

export function createEmptySelection(): Set<string> {
  return new Set();
}

export function toggleInSet(set: Set<string>, id: string): Set<string> {
  const next = new Set(set);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}
