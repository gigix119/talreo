/**
 * Mini sparkline — SVG-based trend visualization.
 */
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const W = 48;
const H = 24;

interface MiniSparklineProps {
  data: number[];
  color: string;
}

export function MiniSparkline({ data, color }: MiniSparklineProps) {
  const safeData = Array.isArray(data) ? data : [];
  if (safeData.length < 2) return null;

  const numericValues = safeData
    .map((v) => (typeof v === 'number' && Number.isFinite(v) ? v : 0));
  if (numericValues.length < 2) return null;

  const min = Math.min(...numericValues);
  const max = Math.max(...numericValues);
  const range = max - min || 1;
  const step = (W - 4) / Math.max(1, numericValues.length - 1);

  const points = numericValues.map((v, i) => {
    const x = 2 + i * step;
    const y = H - 4 - ((v - min) / range) * (H - 8);
    const yNum = Number.isFinite(y) ? y : H / 2;
    return `${x},${yNum}`;
  });

  const d = `M ${points.join(' L ')}`;

  return (
    <View style={{ width: W, height: H }}>
      <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}
