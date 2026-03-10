/**
 * TransactionSwipeableCard — swipe left for Delete, right for Edit.
 * Uses Animated + PanResponder. Smooth mobile animations.
 */
import { memo, useRef } from 'react';
import { View, Text, Animated, PanResponder, Pressable } from 'react-native';
import { useI18n } from '@/i18n';
import { theme } from '@/constants/theme';
import { TransactionIcon } from './TransactionIcon';
import { TransactionMeta } from './TransactionMeta';
import { TransactionAmount } from './TransactionAmount';
import { getTransactionTitle } from '@/utils/transactionDisplay';
import type { Transaction } from '@/types/database';
import type { Currency } from '@/types/database';

const SWIPE_THRESHOLD = 70;
const ACTION_WIDTH = 80;

interface TransactionSwipeableCardProps {
  transaction: Transaction;
  categoryName: string;
  currency: Currency;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const TransactionSwipeableCard = memo(function TransactionSwipeableCard({
  transaction,
  categoryName,
  currency,
  onPress,
  onEdit,
  onDelete,
}: TransactionSwipeableCardProps) {
  const { t } = useI18n();
  const onPressRef = useRef(onPress);
  onPressRef.current = onPress;
  const translateX = useRef(new Animated.Value(0)).current;
  const lastOffset = useRef(0);
  const currentX = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 15,
      onPanResponderGrant: () => {
        lastOffset.current = currentX.current;
      },
      onPanResponderMove: (_, g) => {
        const maxLeft = ACTION_WIDTH;
        const maxRight = ACTION_WIDTH;
        let dx = lastOffset.current + g.dx;
        dx = Math.max(-maxLeft, Math.min(maxRight, dx));
        currentX.current = dx;
        translateX.setValue(dx);
      },
      onPanResponderRelease: (_, g) => {
        const movement = Math.abs(g.dx) + Math.abs(g.dy);
        if (movement < 10) {
          onPressRef.current();
          return;
        }
        const vx = g.vx;
        const val = currentX.current;
        let toValue = 0;
        if (val > SWIPE_THRESHOLD || vx > 0.5) toValue = ACTION_WIDTH;
        else if (val < -SWIPE_THRESHOLD || vx < -0.5) toValue = -ACTION_WIDTH;
        lastOffset.current = toValue;
        currentX.current = toValue;
        Animated.spring(translateX, {
          toValue,
          useNativeDriver: true,
          friction: 10,
          tension: 100,
        }).start();
      },
    })
  ).current;

  const amount = Number(transaction.amount);
  const isIncome = transaction.type === 'income';
  const title = getTransactionTitle(transaction.note, categoryName);

  return (
    <View style={{ marginHorizontal: theme.spacing.lg, marginBottom: 8 }}>
      {/* Actions behind */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          flexDirection: 'row',
          borderRadius: theme.radius.lg,
          overflow: 'hidden',
        }}
      >
        <Pressable
          onPress={() => {
            translateX.setValue(0);
            lastOffset.current = 0;
            currentX.current = 0;
            onEdit();
          }}
          style={{
            width: ACTION_WIDTH,
            backgroundColor: theme.colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '600', color: '#FFFFFF' }}>{t('transactions.detailEdit')}</Text>
        </Pressable>
        <View style={{ flex: 1 }} />
        <Pressable
          onPress={() => {
            translateX.setValue(0);
            lastOffset.current = 0;
            currentX.current = 0;
            onDelete();
          }}
          style={{
            width: ACTION_WIDTH,
            backgroundColor: theme.colors.expense,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '600', color: '#FFFFFF' }}>{t('transactions.detailDelete')}</Text>
        </Pressable>
      </View>

      <Animated.View
        {...panResponder.panHandlers}
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: theme.spacing.lg,
            paddingHorizontal: theme.spacing.lg,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radius.lg,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 6,
            elevation: 3,
          },
          { transform: [{ translateX }] },
        ]}
      >
        <Pressable
          onPress={onPress}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
            opacity: pressed ? 0.95 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
        >
          <TransactionIcon categoryName={categoryName} type={transaction.type} size={40} />
          <View style={{ flex: 1, minWidth: 0, marginLeft: theme.spacing.md }}>
            <Text
              style={{
                fontSize: 17,
                fontWeight: '600',
                color: theme.colors.text.primary,
              }}
              numberOfLines={1}
            >
              {title}
            </Text>
            <TransactionMeta
              categoryName={categoryName}
              date={transaction.transaction_date}
            />
          </View>
          <View style={{ marginLeft: theme.spacing.md }}>
            <TransactionAmount
              amount={amount}
              isIncome={isIncome}
              currency={currency}
            />
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
});
