/**
 * useAnimatedNumber — smooth number counting animation.
 */
import { useState, useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export function useAnimatedNumber(
  target: number,
  duration: number = 600,
  format: (v: number) => string = (v) => Math.round(v).toString()
): string {
  const [display, setDisplay] = useState(() => format(target));
  const prevRef = useRef(target);
  const anim = useRef(new Animated.Value(target)).current;

  useEffect(() => {
    anim.setValue(prevRef.current);
    prevRef.current = target;
    Animated.timing(anim, {
      toValue: target,
      duration,
      useNativeDriver: false,
    }).start();
  }, [target, duration]);

  useEffect(() => {
    const listener = anim.addListener(({ value }: { value: number }) => {
      setDisplay(format(value));
    });
    return () => anim.removeListener(listener);
  }, [anim, format]);

  return display;
}
