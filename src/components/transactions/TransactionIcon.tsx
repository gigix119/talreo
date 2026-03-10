/**
 * TransactionIcon — circular category badge with first letter.
 * Minimal, professional. No emoji.
 */
import { memo } from 'react';
import { View, Text } from 'react-native';
import { theme } from '@/constants/theme';

const CATEGORY_COLORS: Record<string, string> = {
  food: 'rgba(34, 197, 94, 0.15)',
  jedzenie: 'rgba(34, 197, 94, 0.15)',
  bills: 'rgba(59, 130, 246, 0.15)',
  rachunki: 'rgba(59, 130, 246, 0.15)',
  transport: 'rgba(139, 92, 246, 0.15)',
  shopping: 'rgba(236, 72, 153, 0.15)',
  zakupy: 'rgba(236, 72, 153, 0.15)',
  entertainment: 'rgba(245, 158, 11, 0.15)',
  rozrywka: 'rgba(245, 158, 11, 0.15)',
  salary: 'rgba(34, 197, 94, 0.2)',
  income: 'rgba(34, 197, 94, 0.2)',
  default: 'rgba(142, 142, 147, 0.15)',
};

const CATEGORY_ACCENT: Record<string, string> = {
  food: '#22C55E',
  jedzenie: '#22C55E',
  bills: '#3B82F6',
  rachunki: '#3B82F6',
  transport: '#8B5CF6',
  shopping: '#EC4899',
  zakupy: '#EC4899',
  entertainment: '#F59E0B',
  rozrywka: '#F59E0B',
  salary: '#22C55E',
  income: '#22C55E',
  default: '#8E8E93',
};

function getCategoryStyle(categoryName: string | null, type: string) {
  const k = (categoryName || (type === 'income' ? 'income' : 'default')).toLowerCase();
  return {
    bg: CATEGORY_COLORS[k] ?? CATEGORY_COLORS.default,
    accent: CATEGORY_ACCENT[k] ?? CATEGORY_ACCENT.default,
  };
}

function getInitial(categoryName: string | null, type: string): string {
  if (categoryName) {
    const first = categoryName.trim().charAt(0).toUpperCase();
    if (first) return first;
  }
  return type === 'income' ? 'I' : 'E';
}

interface TransactionIconProps {
  categoryName: string | null;
  type: 'expense' | 'income';
  size?: number;
}

export const TransactionIcon = memo(function TransactionIcon({
  categoryName,
  type,
  size = 40,
}: TransactionIconProps) {
  const { bg, accent } = getCategoryStyle(categoryName, type);
  const initial = getInitial(categoryName, type);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          fontSize: size * 0.45,
          fontWeight: '600',
          color: accent,
        }}
      >
        {initial}
      </Text>
    </View>
  );
});
