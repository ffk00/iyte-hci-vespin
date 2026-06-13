import Svg, { Circle, Line, Rect } from "react-native-svg";

type Props = {
  size?: number;
};

// Three EQ faders with knobs at different heights, inside the shared
// double-border frame. Colors are baked to the brand palette to match the
// exported design.
export function EqPictogram({ size = 28 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Circle cx={9} cy={15} r={2.5} fill="#F6F1E8" stroke="#F6F1E8" />
      <Circle cx={16} cy={21} r={2.5} fill="#F6F1E8" stroke="#F6F1E8" />
      <Circle cx={23} cy={11} r={2.5} fill="#F6F1E8" stroke="#F6F1E8" />
      <Line x1={23.248} y1={4.5} x2={23.248} y2={27.3848} stroke="#F6F1E8" strokeWidth={3} strokeLinecap="round" />
      <Line x1={16.1289} y1={4.5} x2={16.1289} y2={27.3848} stroke="#F6F1E8" strokeWidth={3} strokeLinecap="round" />
      <Line x1={9.06934} y1={4.5} x2={9.06934} y2={27.3848} stroke="#F6F1E8" strokeWidth={3} strokeLinecap="round" />
      <Rect x={0.5} y={0.5} width={31} height={31} stroke="black" />
      <Rect x={2.5} y={2.5} width={27} height={27} stroke="black" />
    </Svg>
  );
}
