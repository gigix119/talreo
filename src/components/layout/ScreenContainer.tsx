/**
 * ScreenContainer — base layout wrapper with safe area insets.
 * Use on every screen for consistent padding and safe area handling.
 */
import { View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenContainerProps extends ViewProps {
  children: React.ReactNode;
  /** Add horizontal padding (default: 20) */
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
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: withPadding ? 20 : insets.left,
          paddingRight: withPadding ? 20 : insets.right,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
