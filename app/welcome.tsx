/**
 * Welcome screen — premium fintech-style landing experience.
 * Composes: Header, Hero, Features, Preview, Use Cases, CTA.
 */
import { ScrollView } from 'react-native';
import { theme } from '@/constants/theme';
import {
  WelcomeHeader,
  WelcomeHero,
  WelcomeFeatures,
  WelcomePreview,
  WelcomeUseCases,
  WelcomeCTA,
} from '@/components/welcome';

export default function WelcomeScreen() {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ paddingBottom: theme.spacing.xxl }}
      showsVerticalScrollIndicator={false}
    >
      <WelcomeHeader />
      <WelcomeHero />
      <WelcomeFeatures />
      <WelcomePreview />
      <WelcomeUseCases />
      <WelcomeCTA />
    </ScrollView>
  );
}
