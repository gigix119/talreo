/**
 * TransactionMeta — category • date subtitle.
 */
import { memo } from 'react';
import { Text } from 'react-native';
import { theme } from '@/constants/theme';
import { formatDateShort } from '@/utils/date';

interface TransactionMetaProps {
  categoryName: string;
  date: string;
}

export const TransactionMeta = memo(function TransactionMeta({
  categoryName,
  date,
}: TransactionMetaProps) {
  return (
    <Text
      style={{
        fontSize: 13,
        color: theme.colors.text.secondary,
        marginTop: 4,
      }}
      numberOfLines={1}
    >
      {categoryName} · {formatDateShort(date)}
    </Text>
  );
});
