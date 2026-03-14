/**
 * Add/Edit savings goal.
 */
import { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useProfile } from '@/hooks/useProfile';
import { useSavingsGoals } from '@/hooks/useSavingsGoals';
import { useI18n } from '@/i18n';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { theme } from '@/constants/theme';

export default function AddGoalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    goalId?: string;
    name?: string;
    targetAmount?: string;
    currentAmount?: string;
    targetDate?: string;
  }>();
  const { profile } = useProfile();
  const currency = profile?.currency ?? 'PLN';
  const { t } = useI18n();
  const { createSavingsGoal, updateSavingsGoal } = useSavingsGoals();

  const [name, setName] = useState(params.name ?? '');
  const [targetAmount, setTargetAmount] = useState(params.targetAmount ?? '');
  const [currentAmount, setCurrentAmount] = useState(params.currentAmount ?? '');
  const [targetDate, setTargetDate] = useState(params.targetDate ?? '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isEdit = !!params.goalId;

  useEffect(() => {
    if (params.name) setName(params.name);
    if (params.targetAmount) setTargetAmount(params.targetAmount);
    if (params.currentAmount) setCurrentAmount(params.currentAmount);
    if (params.targetDate) setTargetDate(params.targetDate);
  }, [params.goalId, params.name, params.targetAmount, params.currentAmount, params.targetDate]);

  async function handleSave() {
    setError('');
    const target = parseFloat(targetAmount.replace(',', '.'));
    const current = parseFloat(currentAmount.replace(',', '.')) || 0;
    if (!name.trim()) {
      setError(t('validation.required'));
      return;
    }
    if (isNaN(target) || target <= 0) {
      setError(t('validation.invalidAmount'));
      return;
    }
    if (current < 0 || current > target) {
      setError(t('validation.invalidAmount'));
      return;
    }
    setLoading(true);
    try {
      if (isEdit && params.goalId) {
        await updateSavingsGoal(params.goalId, {
          name: name.trim(),
          target_amount: target,
          current_amount: current,
          target_date: targetDate.trim() || null,
        });
      } else {
        await createSavingsGoal({
          name: name.trim(),
          target_amount: target,
          current_amount: current,
          target_date: targetDate.trim() || null,
        });
      }
      router.back();
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
            {isEdit ? t('goals.editGoalTitle') : t('goals.addGoalTitle')}
          </Text>
          <Text
            onPress={() => router.back()}
            style={{ fontSize: 16, color: theme.colors.primary, fontWeight: '500' }}
          >
            {t('common.cancel')}
          </Text>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{ paddingBottom: theme.spacing.xxl }}
            keyboardShouldPersistTaps="handled"
          >
            <Input
              label={t('goals.name')}
              value={name}
              onChangeText={setName}
              placeholder={t('goals.placeholderGoalName')}
            />
            <Input
              label={t('goals.targetAmount')}
              value={targetAmount}
              onChangeText={setTargetAmount}
              placeholder={t('goals.placeholderAmount')}
              keyboardType="decimal-pad"
            />
            <Input
              label={t('goals.currentAmount')}
              value={currentAmount}
              onChangeText={setCurrentAmount}
              placeholder={t('goals.placeholderAmount')}
              keyboardType="decimal-pad"
            />
            <Input
              label={`${t('goals.targetDate')} (${t('goals.optional')})`}
              value={targetDate}
              onChangeText={setTargetDate}
              placeholder={t('goals.placeholderDate')}
            />
            {error ? (
              <Text style={{ fontSize: 12, color: theme.colors.error, marginTop: theme.spacing.sm }}>{error}</Text>
            ) : null}
            <Button onPress={handleSave} disabled={loading} fullWidth style={{ marginTop: theme.spacing.xl }}>
              {loading ? t('common.loading') : t('common.save')}
            </Button>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ScreenContainer>
  );
}
