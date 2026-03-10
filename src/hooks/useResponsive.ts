/**
 * Responsive breakpoints — mobile-first.
 */
import { useWindowDimensions } from 'react-native';

const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

export function useResponsive() {
  const { width } = useWindowDimensions();
  return {
    width,
    isMobile: width < BREAKPOINTS.tablet,
    isTablet: width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop,
    isDesktop: width >= BREAKPOINTS.desktop,
    /** Columns for grid: 1 on mobile, 2 on tablet, 3-4 on desktop */
    gridCols: width >= BREAKPOINTS.desktop ? 4 : width >= BREAKPOINTS.tablet ? 2 : 1,
  };
}
