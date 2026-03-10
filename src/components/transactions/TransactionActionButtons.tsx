/**
 * TransactionActionButtons — Edit and Delete as strong action cards.
 */
import { View, Text, Pressable } from 'react-native';
import { useI18n } from '@/i18n';
import { theme } from '@/constants/theme';

interface TransactionActionButtonsProps {
  onEdit: () => void;
  onDelete: () => void;
  deleteDisabled?: boolean;
}

export function TransactionActionButtons({
  onEdit,
  onDelete,
  deleteDisabled = false,
}: TransactionActionButtonsProps) {
  const { t } = useI18n();

  return (
    <View style={{ gap: theme.spacing.md }}>
      <Pressable
        onPress={onEdit}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 16,
          paddingHorizontal: theme.spacing.lg,
          backgroundColor: theme.colors.primary,
          borderRadius: theme.radius.lg,
          opacity: pressed ? 0.9 : 1,
        })}
      >
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF' }}>
          {t('transactions.detailEdit')}
        </Text>
      </Pressable>
      <Pressable
        onPress={onDelete}
        disabled={deleteDisabled}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 16,
          paddingHorizontal: theme.spacing.lg,
          backgroundColor: theme.colors.surface,
          borderWidth: 2,
          borderColor: theme.colors.expense,
          borderRadius: theme.radius.lg,
          opacity: deleteDisabled || pressed ? 0.7 : 1,
        })}
      >
        <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.expense }}>
          {t('transactions.detailDelete')}
        </Text>
      </Pressable>
    </View>
  );
}
