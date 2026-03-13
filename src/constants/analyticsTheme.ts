/**
 * Analytics dashboard — premium fintech design tokens.
 * Copilot / Apple Stocks / Revolut inspired.
 */
export const analyticsColors = {
  income: '#22C55E',
  incomeMuted: 'rgba(34, 197, 94, 0.12)',
  expense: '#EF4444',
  expenseMuted: 'rgba(239, 68, 68, 0.12)',
  balance: '#3B82F6',
  balanceMuted: 'rgba(59, 130, 246, 0.12)',
  analytics: '#8B5CF6',
  analyticsMuted: 'rgba(139, 92, 246, 0.12)',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  insight: '#6366F1',
  insightMuted: 'rgba(99, 102, 241, 0.1)',
} as const;

export const analyticsShadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHover: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
} as const;

export const analyticsSpacing = {
  sectionGap: 20,
  cardGap: 12,
  headerMargin: 8,
} as const;

export const analyticsRadius = {
  card: 12,
  pill: 12,
  badge: 8,
} as const;
