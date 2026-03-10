/**
 * Loading skeleton — data workspace feel.
 */
import { View } from 'react-native';
import { theme } from '@/constants/theme';

function SkeletonBox({ width, height, radius = 12 }: { width: number | string; height: number; radius?: number }) {
  return (
    <View
      style={{
        width,
        height,
        backgroundColor: theme.colors.border,
        borderRadius: radius,
        opacity: 0.4,
      }}
    />
  );
}

export function AnalyticsSkeleton() {
  return (
    <View style={{ gap: theme.spacing.xl }}>
      <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
        {[1, 2, 3, 4].map((i) => (
          <SkeletonBox key={i} width={150} height={100} radius={16} />
        ))}
      </View>
      <SkeletonBox width="100%" height={220} radius={16} />
      <View style={{ flexDirection: 'row', gap: theme.spacing.lg }}>
        <SkeletonBox width="48%" height={200} radius={16} />
        <SkeletonBox width="48%" height={200} radius={16} />
      </View>
      <SkeletonBox width="100%" height={200} radius={16} />
      <View style={{ flexDirection: 'row', gap: theme.spacing.lg }}>
        <SkeletonBox width="48%" height={140} radius={16} />
        <SkeletonBox width="48%" height={140} radius={16} />
      </View>
    </View>
  );
}
