/**
 * WelcomeUseCases — For Individuals | For Businesses. Two-column cards.
 */
import { View, Text } from 'react-native';
import { useI18n } from '@/i18n';
import { theme } from '@/constants/theme';
import { Card } from '@/components/ui/Card';

const INDIVIDUAL_KEYS = ['welcome.individuals1', 'welcome.individuals2', 'welcome.individuals3', 'welcome.individuals4'] as const;
const BUSINESS_KEYS = ['welcome.businesses1', 'welcome.businesses2', 'welcome.businesses3', 'welcome.businesses4'] as const;

function BulletList({ items }: { items: string[] }) {
  return (
    <View style={{ gap: theme.spacing.sm }}>
      {items.map((item, idx) => (
        <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: theme.colors.primary,
            }}
          />
          <Text style={{ fontSize: 15, color: theme.colors.text.secondary }}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export function WelcomeUseCases() {
  const { t } = useI18n();

  return (
    <View style={{ paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.xxl }}>
      <Text
        style={{
          fontSize: 22,
          fontWeight: '700',
          color: theme.colors.text.primary,
          marginBottom: theme.spacing.xl,
        }}
      >
        {t('welcome.builtForEveryone')}
      </Text>
      <View style={{ gap: theme.spacing.md }}>
        <Card padding="lg" elevated>
          <Text
            style={{
              fontSize: 17,
              fontWeight: '600',
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.md,
            }}
          >
            {t('welcome.forIndividuals')}
          </Text>
          <BulletList items={INDIVIDUAL_KEYS.map((k) => t(k))} />
        </Card>
        <Card padding="lg" elevated>
          <Text
            style={{
              fontSize: 17,
              fontWeight: '600',
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.md,
            }}
          >
            {t('welcome.forBusinesses')}
          </Text>
          <BulletList items={BUSINESS_KEYS.map((k) => t(k))} />
        </Card>
      </View>
    </View>
  );
}
