/**
 * ConfirmDialog — modal confirmation for destructive actions.
 */
import { View, Text, Modal, Pressable } from 'react-native';
import { Button } from './Button';
import { Card } from './Card';
import { theme } from '@/constants/theme';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  destructive = true,
}: ConfirmDialogProps) {
  if (!visible) return null;
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
          backgroundColor: 'rgba(0,0,0,0.4)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: theme.spacing.lg,
        }}
        onPress={onCancel}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <Card padding="lg" elevated>
            <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.text.primary }}>
              {title}
            </Text>
            {message ? (
              <Text
                style={{
                  fontSize: 14,
                  color: theme.colors.text.secondary,
                  marginTop: theme.spacing.sm,
                }}
              >
                {message}
              </Text>
            ) : null}
            <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.lg }}>
              <Button variant="secondary" onPress={onCancel} style={{ flex: 1 }}>
                {cancelLabel ?? 'Cancel'}
              </Button>
              <Button
                variant="primary"
                onPress={() => {
                  onConfirm();
                  onCancel();
                }}
                style={[
                  { flex: 1 },
                  destructive ? { backgroundColor: theme.colors.error } : {},
                ]}
              >
                {confirmLabel ?? 'Delete'}
              </Button>
            </View>
          </Card>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
