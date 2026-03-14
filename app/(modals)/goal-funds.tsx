/**
 * Add/Withdraw funds to/from savings goal.
 */
import { useState } from 'react';
import { View, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { useProfile } from '@/hooks/useProfile';
import { useSavingsGoals } from '@/hooks/useSavingsGoals';
import { useI18n } from '@/i18n';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { theme } from '@/constants/theme';

export default function GoalFundsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ goalId: string; action: 'add' | 'withdraw'; name: string }>();
  const { profile } = useProfile();
  const currency = profile?.currency ?? 'PLN';
  const { t } = useI18n();
  const { addFundsToGoal, subtractFundsFromGoal } = useSavingsGoals();

  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isAdd = params.action === 'add';

  async function handleSave() {
    setError('');
    const amt = parseFloat(amount.replace(',', '.'));
    if (isNaN(amt) || amt <= 0) {
      setError(t('validation.invalidAmount'));
      return;
    }
    setLoading(true);
    try {
      if (params.goalId) {
        if (isAdd) {
          await addFundsToGoal(params.goalId, amt);
        } else {
          await subtractFundsFromGoal(params.goalId, amt);
        }
        router.back();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer withPadding={false}>
      <View style={{ paddingHorizontal: 20, paddingTop: theme.spacing.xl, paddingBottom: theme.spacing.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: theme.colors.text.primary }}>
            {isAdd ? t('goals.addFunds') : t('goals.withdraw')}
          </Text>
          <Text
            onPress={() => router.back()}
            style={{ fontSize: 16, color: theme.colors.primary, fontWeight: '500' }}
          >
            {t('common.cancel')}
          </Text>
        </View>
        <Text style={{ fontSize: 14, color: theme.colors.text.secondary, marginTop: 8 }}>
          {params.name}
        </Text>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, marginTop: theme.spacing.xl }}>
          <Input
            label={t('goals.amount')}
            value={amount}
            onChangeText={setAmount}
            placeholder={t('goals.placeholderAmount')}
            keyboardType="decimal-pad"
          />
          {error ? (
            <Text style={{ fontSize: 12, color: theme.colors.error, marginTop: theme.spacing.sm }}>{error}</Text>
          ) : null}
          <Button onPress={handleSave} disabled={loading} fullWidth style={{ marginTop: theme.spacing.xl }}>
            {loading ? t('common.loading') : t('common.save')}
          </Button>
        </KeyboardAvoidingView>
      </View>
    </ScreenContainer>
  );
}
