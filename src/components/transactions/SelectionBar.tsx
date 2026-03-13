/**
 * SelectionBar — top action bar when multi-select mode is active.
 */
import { View, Text, Pressable } from 'react-native';
import { useI18n } from '@/i18n';
import { theme } from '@/constants/theme';

interface SelectionBarProps {
  selectedCount: number;
  onDelete: () => void;
  onChangeCategory: () => void;
  onCancel: () => void;
}

export function SelectionBar({
  selectedCount,
  onDelete,
  onChangeCategory,
  onCancel,
}: SelectionBarProps) {
  const { t } = useI18n();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.sm,
        backgroundColor: theme.colors.primary + '15',
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
      }}
    >
      <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.text.primary }}>
        {selectedCount} {t('transactions.selected')}
      </Text>
      <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
        <Pressable
          onPress={onChangeCategory}
          style={({ pressed }) => ({
            paddingHorizontal: theme.spacing.md,
            paddingVertical: 8,
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.surface,
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.primary }}>
            {t('transactions.changeCategory')}
          </Text>
        </Pressable>
        <Pressable
          onPress={onDelete}
          style={({ pressed }) => ({
            paddingHorizontal: theme.spacing.md,
            paddingVertical: 8,
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.expense,
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#FFFFFF' }}>
            {t('transactions.deleteSelected')}
          </Text>
        </Pressable>
        <Pressable
          onPress={onCancel}
          style={({ pressed }) => ({
            paddingHorizontal: theme.spacing.md,
            paddingVertical: 8,
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.surface,
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.text.secondary }}>
            {t('common.cancel')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
