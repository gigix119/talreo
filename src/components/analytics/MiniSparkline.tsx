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
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = (W - 4) / (data.length - 1);

  const points = data.map((v, i) => {
    const x = 2 + i * step;
    const y = H - 4 - ((v - min) / range) * (H - 8);
    return `${x},${y}`;
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
