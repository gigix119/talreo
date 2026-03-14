/**
 * ScreenContainer — base layout wrapper with safe area insets.
 * Mobile-first: top safe area for status bar, horizontal padding for content.
 * Bottom padding NOT applied — scroll content uses BOTTOM_CONTENT_PADDING.
 */
import { View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PAGE_PADDING_H } from '@/constants/layout';

interface ScreenContainerProps extends ViewProps {
  children: React.ReactNode;
  /** Add horizontal padding (default: true, uses PAGE_PADDING_H) */
  withPadding?: boolean;
}

export function ScreenContainer({
  children,
  withPadding = true,
  style,
  ...props
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        {
          flex: 1,
          overflow: 'hidden',
          paddingTop: insets.top,
          paddingBottom: 0,
          paddingLeft: withPadding ? Math.max(PAGE_PADDING_H, insets.left) : insets.left,
          paddingRight: withPadding ? Math.max(PAGE_PADDING_H, insets.right) : insets.right,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
