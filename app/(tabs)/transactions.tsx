/**
 * Transactions screen — placeholder. Full list in Step 6.
 */
import { View, Text } from 'react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';

export default function TransactionsScreen() {
  return (
    <ScreenContainer>
      <View style={{ flex: 1, paddingTop: 48, paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: '#1C1C1E' }}>
          Transakcje
        </Text>
        <Text style={{ fontSize: 14, color: '#8E8E93', marginTop: 8 }}>
          Transaction list in Step 6
        </Text>
      </View>
    </ScreenContainer>
  );
}
