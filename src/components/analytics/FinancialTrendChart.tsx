/**
 * Financial Trend Chart — TradingView/Binance style.
 * Inspect mode (long-press), Compare mode (tap-tap), range summary.
 */
import { useState, useRef, useCallback, useMemo, memo } from 'react';
import {
  View,
  Text,
  Pressable,
  Dimensions,
  PanResponder,
  LayoutChangeEvent,
} from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Card } from '@/components/ui/Card';
import { useI18n } from '@/i18n';
import { theme } from '@/constants/theme';
import { PAGE_PADDING_H } from '@/constants/layout';
import { analyticsColors, analyticsShadows } from '@/constants/analyticsTheme';
import { formatAmount } from '@/utils/currency';
import { formatMonth } from '@/utils/date';
import type { MonthlyTrendItem } from '@/types/database';

const CHART_HEIGHT = 200;
const CHART_PADDING_H = 40;
const LONG_PRESS_MS = 350;

type ChartMode = 'inspect' | 'compare';
type Series = 'income' | 'expense' | 'balance';

interface FinancialTrendChartProps {
  data: MonthlyTrendItem[];
  currency: string;
  title: string;
  emptyText: string;
}

export const FinancialTrendChart = memo(function FinancialTrendChart({
  data,
  currency,
  title,
  emptyText,
}: FinancialTrendChartProps) {
  const { t } = useI18n();
  const [mode, setMode] = useState<ChartMode>('inspect');
  const [selectedSeries, setSelectedSeries] = useState<Series[]>(['balance']);
  const [crosshairIndex, setCrosshairIndex] = useState<number | null>(null);
  const [compareStart, setCompareStart] = useState<number | null>(null);
  const [compareEnd, setCompareEnd] = useState<number | null>(null);
  const screenWidth = Dimensions.get('window').width - PAGE_PADDING_H * 2 - CHART_PADDING_H;
  const [chartLayout, setChartLayout] = useState({ width: Math.max(200, screenWidth) });
  const layoutRef = useRef({ width: Math.max(200, screenWidth), left: 0 });
  const compareRef = useRef({ start: null as number | null, end: null as number | null });
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const crosshairRef = useRef<number | null>(null);
  const modeRef = useRef(mode);
  const chartContainerRef = useRef<View | null>(null);

  compareRef.current = { start: compareStart, end: compareEnd };
  modeRef.current = mode;
  crosshairRef.current = crosshairIndex;

  const hasEnoughData = data.length >= 2;

  const xToIndex = useCallback((x: number) => {
    const w = layoutRef.current.width;
    if (w <= 0) return 0;
    const idx = Math.round((x / w) * (data.length - 1));
    return Math.max(0, Math.min(data.length - 1, idx));
  }, [data.length]);

  const clearComparison = useCallback(() => {
    setCompareStart(null);
    setCompareEnd(null);
    setCrosshairIndex(null);
    crosshairRef.current = null;
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const x = evt.nativeEvent.locationX ?? evt.nativeEvent.pageX ?? 0;
        const idx = xToIndex(x);
        if (modeRef.current === 'inspect') {
          longPressTimer.current = setTimeout(() => {
            longPressTimer.current = null;
            setCrosshairIndex(idx);
          }, LONG_PRESS_MS);
        }
      },
      onPanResponderMove: (_, g) => {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
        if (modeRef.current === 'inspect' && crosshairRef.current !== null) {
          const localX = g.moveX - layoutRef.current.left;
          const idx = xToIndex(Math.max(0, localX));
          crosshairRef.current = idx;
          setCrosshairIndex(idx);
        }
      },
      onPanResponderRelease: (evt) => {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
          const ne = evt.nativeEvent as { locationX?: number; pageX?: number };
          const x = ne.locationX ?? ne.pageX! - layoutRef.current.left;
          const idx = xToIndex(Math.max(0, x));
          if (mode === 'compare') {
            const { start, end } = compareRef.current;
            if (start === null) {
              setCompareStart(idx);
            } else if (end === null) {
              const [a, b] = idx < start ? [idx, start] : [start, idx];
              setCompareStart(a);
              setCompareEnd(b);
            } else {
              setCompareStart(idx);
              setCompareEnd(null);
            }
          } else {
            crosshairRef.current = null;
            setCrosshairIndex(null);
          }
        } else if (crosshairRef.current !== null) {
          crosshairRef.current = null;
          setTimeout(() => setCrosshairIndex(null), 80);
        }
      },
    })
  ).current;

  const toggleSeries = useCallback((s: Series) => {
    setSelectedSeries((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }, []);

  const primarySeries: Series = selectedSeries.includes('balance')
    ? 'balance'
    : selectedSeries.includes('income')
      ? 'income'
      : 'expense';

  const chartData = useMemo(
    () =>
      data.map((d, i) => ({
        value: d[primarySeries],
        label: new Date(d.month + 'T00:00:00').toLocaleDateString('pl-PL', { month: 'short' }),
        dataPointText: formatAmount(d[primarySeries], currency),
      })),
    [data, primarySeries, currency]
  );

  const primaryColor =
    primarySeries === 'income'
      ? analyticsColors.income
      : primarySeries === 'expense'
        ? analyticsColors.expense
        : analyticsColors.balance;

  const showCompare = compareStart !== null && compareEnd !== null;
  const rangeStart = showCompare ? Math.min(compareStart, compareEnd) : 0;
  const rangeEnd = showCompare ? Math.max(compareStart, compareEnd) : 0;
  const rangeData = showCompare ? data.slice(rangeStart, rangeEnd + 1) : [];

  const rangeIncome = rangeData.reduce((s, d) => s + d.income, 0);
  const rangeExpense = rangeData.reduce((s, d) => s + d.expense, 0);
  const rangeBalance = rangeData.length
    ? rangeData[rangeData.length - 1].balance - rangeData[0].balance
    : 0;
  const rangeBalancePct =
    rangeData.length && rangeData[0].balance !== 0
      ? (rangeBalance / Math.abs(rangeData[0].balance)) * 100
      : 0;

  const compDiff = showCompare
    ? data[rangeEnd].balance - data[rangeStart].balance
    : 0;
  const compPct =
    showCompare && data[rangeStart].balance !== 0
      ? ((data[rangeEnd].balance - data[rangeStart].balance) / Math.abs(data[rangeStart].balance)) * 100
      : 0;

  if (data.length === 0) {
    return (
      <Card
        padding="lg"
        elevated
        style={{ marginTop: theme.spacing.sm, alignItems: 'center' }}
      >
        <Text style={{ fontSize: 16, color: theme.colors.text.secondary, fontWeight: '500' }}>
          {title}
        </Text>
        <Text style={{ fontSize: 14, color: theme.colors.text.tertiary, marginTop: 12 }}>
          {emptyText}
        </Text>
        <Text style={{ fontSize: 13, color: theme.colors.text.tertiary, marginTop: 4 }}>
          {t('analytics.chartAddMoreData')}
        </Text>
      </Card>
    );
  }

  if (!hasEnoughData) {
    return (
      <Card
        padding="lg"
        elevated
        style={{ marginTop: theme.spacing.sm, alignItems: 'center' }}
      >
        <Text style={{ fontSize: 16, color: theme.colors.text.secondary, fontWeight: '500' }}>
          {title}
        </Text>
        <Text style={{ fontSize: 14, color: theme.colors.text.tertiary, marginTop: 12 }}>
          {t('analytics.chartAddMoreData')}
        </Text>
      </Card>
    );
  }

  const chartWidthActual = layoutRef.current.width;

  return (
    <View style={{ marginTop: theme.spacing.lg }}>
      <Text style={{ fontSize: 15, fontWeight: '600', color: theme.colors.text.primary, marginBottom: theme.spacing.sm }}>
        {title}
      </Text>
      <Card
        padding="md"
        elevated
        style={{ overflow: 'hidden' }}
        onLayout={(e: LayoutChangeEvent) => {
          const w = Math.max(200, e.nativeEvent.layout.width - CHART_PADDING_H);
          layoutRef.current.width = w;
          setChartLayout({ width: w });
        }}
      >
        {/* Mode: Inspect | Compare */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: theme.colors.background,
            borderRadius: theme.radius.md,
            padding: 4,
            marginBottom: theme.spacing.md,
            alignSelf: 'flex-start',
          }}
        >
          {(['inspect', 'compare'] as const).map((m) => (
            <Pressable
              key={m}
              onPress={() => {
                setMode(m);
                if (m === 'inspect') clearComparison();
              }}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: theme.radius.sm,
                backgroundColor: mode === m ? theme.colors.surface : 'transparent',
                ...(mode === m ? analyticsShadows.card : {}),
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: mode === m ? theme.colors.text.primary : theme.colors.text.secondary,
                }}
              >
                {m === 'inspect' ? t('analytics.chartInspect') : t('analytics.chartCompare')}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Series toggles */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: theme.spacing.md }}>
          {(['income', 'expense', 'balance'] as const).map((s) => (
            <Pressable
              key={s}
              onPress={() => toggleSeries(s)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: theme.radius.full,
                backgroundColor: selectedSeries.includes(s)
                  ? s === 'income'
                    ? analyticsColors.incomeMuted
                    : s === 'expense'
                      ? analyticsColors.expenseMuted
                      : analyticsColors.balanceMuted
                  : theme.colors.background,
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor:
                    s === 'income'
                      ? analyticsColors.income
                      : s === 'expense'
                        ? analyticsColors.expense
                        : analyticsColors.balance,
                  marginRight: 6,
                }}
              />
              <Text style={{ fontSize: 13, color: theme.colors.text.primary, fontWeight: '500' }}>
                {s === 'income' ? t('analytics.totalIncome') : s === 'expense' ? t('analytics.totalExpenses') : t('analytics.balance')}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Chart area */}
        <View
          ref={chartContainerRef}
          {...panResponder.panHandlers}
          style={{ position: 'relative' }}
          onLayout={(e) => {
            layoutRef.current.width = e.nativeEvent.layout.width - 32;
            chartContainerRef.current?.measureInWindow((x) => {
              layoutRef.current.left = x;
            });
          }}
        >
          <LineChart
            data={chartData}
            width={chartWidthActual}
            height={CHART_HEIGHT}
            color={primaryColor}
            thickness={2}
            hideDataPoints={false}
            dataPointsColor={primaryColor}
            startFillColor={`${primaryColor}20`}
            endFillColor={`${primaryColor}06`}
            startOpacity={0.9}
            endOpacity={0.2}
            initialSpacing={28}
            endSpacing={28}
            yAxisColor={theme.colors.border}
            xAxisColor={theme.colors.border}
            yAxisLabelWidth={50}
            noOfSections={4}
            formatYLabel={(v) => formatAmount(Number(v), currency)}
          />

          {/* Crosshair (inspect mode, long-press) */}
          {crosshairIndex !== null && data[crosshairIndex] && (
            <>
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  left: 28 + (crosshairIndex / (data.length - 1)) * (chartWidthActual - 56),
                  top: 0,
                  bottom: 0,
                  width: 2,
                  backgroundColor: theme.colors.primary,
                  opacity: 0.8,
                }}
              />
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  top: 8,
                  left: Math.min(
                    Math.max(8, (crosshairIndex / (data.length - 1)) * (chartWidthActual - 56) - 75),
                    chartLayout.width - 180
                  ),
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.radius.lg,
                  padding: theme.spacing.md,
                  ...analyticsShadows.card,
                  minWidth: 150,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: theme.colors.text.primary, marginBottom: 10 }}>
                  {formatMonth(data[crosshairIndex].month)}
                </Text>
                <View style={{ gap: 6 }}>
                  <Row label={t('analytics.totalIncome')} value={data[crosshairIndex].income} currency={currency} color={analyticsColors.income} />
                  <Row label={t('analytics.totalExpenses')} value={data[crosshairIndex].expense} currency={currency} color={analyticsColors.expense} />
                  <Row label={t('analytics.balance')} value={data[crosshairIndex].balance} currency={currency} color={analyticsColors.balance} bold />
                  {crosshairIndex > 0 && (
                    <Row
                      label={t('analytics.changeVsPrev')}
                      value={data[crosshairIndex].balance - data[crosshairIndex - 1].balance}
                      currency={currency}
                      color={data[crosshairIndex].balance >= data[crosshairIndex - 1].balance ? analyticsColors.success : analyticsColors.expense}
                    />
                  )}
                </View>
              </View>
            </>
          )}

          {/* Comparison overlay */}
          {showCompare && (
            <View
              pointerEvents="box-none"
              style={{
                position: 'absolute',
                bottom: 8,
                left: 8,
                right: 8,
                backgroundColor: theme.colors.surface,
                borderRadius: theme.radius.lg,
                padding: theme.spacing.lg,
                ...analyticsShadows.card,
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', color: theme.colors.text.primary, marginBottom: 12 }}>
                {formatMonth(data[rangeStart].month)} → {formatMonth(data[rangeEnd].month)}
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.lg, marginBottom: 12 }}>
                <Col label="Start" value={data[rangeStart].balance} currency={currency} />
                <Col label="End" value={data[rangeEnd].balance} currency={currency} />
                <Col
                  label="Change"
                  value={compDiff}
                  currency={currency}
                  pct={compPct}
                  highlight
                  positive={compDiff >= 0}
                />
              </View>
              <View style={{ borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 12 }}>
                <Text style={{ fontSize: 12, color: theme.colors.text.secondary, marginBottom: 6 }}>
                  {t('analytics.chartRangeSummary')}
                </Text>
                <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
                  <Text style={{ fontSize: 12, color: theme.colors.text.secondary }}>
                    Income: {formatAmount(rangeIncome, currency)}
                  </Text>
                  <Text style={{ fontSize: 12, color: theme.colors.text.secondary }}>
                    Expenses: {formatAmount(rangeExpense, currency)}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: rangeBalance >= 0 ? analyticsColors.success : analyticsColors.expense,
                    }}
                  >
                    Net: {rangeBalance >= 0 ? '+' : ''}{formatAmount(rangeBalance, currency)} ({rangeBalancePct >= 0 ? '+' : ''}{rangeBalancePct.toFixed(1)}%)
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={clearComparison}
                style={{
                  marginTop: 12,
                  alignSelf: 'flex-start',
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  backgroundColor: theme.colors.background,
                  borderRadius: theme.radius.md,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: theme.colors.text.secondary }}>
                  {t('analytics.chartClear')}
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        <Text style={{ fontSize: 11, color: theme.colors.text.tertiary, marginTop: 8 }}>
          {mode === 'inspect'
            ? t('analytics.chartLongPressToInspect')
            : t('analytics.chartTapToCompare')}
        </Text>
      </Card>
    </View>
  );
});

function Row({
  label,
  value,
  currency,
  color,
  bold,
}: {
  label: string;
  value: number;
  currency: string;
  color: string;
  bold?: boolean;
}) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text style={{ fontSize: 12, color: theme.colors.text.secondary }}>{label}</Text>
      <Text style={{ fontSize: 13, fontWeight: bold ? '700' : '600', color }}>{formatAmount(value, currency)}</Text>
    </View>
  );
}

function Col({
  label,
  value,
  currency,
  pct,
  highlight,
  positive,
}: {
  label: string;
  value: number;
  currency: string;
  pct?: number;
  highlight?: boolean;
  positive?: boolean;
}) {
  return (
    <View>
      <Text style={{ fontSize: 11, color: theme.colors.text.tertiary }}>{label}</Text>
      <Text
        style={{
          fontSize: 14,
          fontWeight: '700',
          color: highlight ? (positive ? analyticsColors.success : analyticsColors.expense) : theme.colors.text.primary,
        }}
      >
        {value >= 0 ? '+' : ''}{formatAmount(value, currency)}
        {highlight && pct !== undefined && ` (${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%)`}
      </Text>
    </View>
  );
}
