/**
 * DeleteTransactionDialog — confirmation modal before delete.
 */
import { View, Text, Modal, Pressable } from 'react-native';
import { useI18n } from '@/i18n';
import { theme } from '@/constants/theme';

interface DeleteTransactionDialogProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function DeleteTransactionDialog({
  visible,
  onCancel,
  onConfirm,
  loading = false,
}: DeleteTransactionDialogProps) {
  const { t } = useI18n();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: theme.spacing.lg,
        }}
        onPress={onCancel}
      >
        <Pressable
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radius.xl,
            padding: theme.spacing.xl,
            width: '100%',
            maxWidth: 340,
          }}
          onPress={(e) => e.stopPropagation()}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: '700',
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.sm,
            }}
          >
            {t('transactions.deleteConfirmTitle')}
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: theme.colors.text.secondary,
              lineHeight: 24,
              marginBottom: theme.spacing.xl,
            }}
          >
            {t('transactions.deleteConfirmBody')}
          </Text>
          <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            <Pressable
              onPress={onCancel}
              disabled={loading}
              style={({ pressed }) => ({
                flex: 1,
                paddingVertical: 14,
                borderRadius: theme.radius.lg,
                backgroundColor: theme.colors.background,
                alignItems: 'center',
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.text.primary }}>
                {t('common.cancel')}
              </Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              disabled={loading}
              style={({ pressed }) => ({
                flex: 1,
                paddingVertical: 14,
                borderRadius: theme.radius.lg,
                backgroundColor: theme.colors.expense,
                alignItems: 'center',
                opacity: loading || pressed ? 0.8 : 1,
              })}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF' }}>
                {loading ? t('common.loading') : t('common.delete')}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
