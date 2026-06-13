import Svg, { Circle, Path, Rect } from "react-native-svg";

type Props = {
  size?: number;
};

// Vespin Retro speaker mark: concentric driver rings inside the double-border
// frame shared by every tab pictogram. Colors are baked to the brand palette
// to match the exported design. The Figma drop-shadow filter is intentionally
// omitted — react-native-svg does not render SVG filter primitives.
export function HomePictogram({ size = 34 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 36 38" fill="none">
      <Circle cx={17.5} cy={16.5} r={13.5} fill="black" />
      <Circle cx={17.423} cy={16.4231} r={11.4231} fill="#F6F1E8" />
      <Circle cx={17.346} cy={16.3462} r={9.34615} fill="black" />
      <Circle cx={17.2691} cy={16.2692} r={7.26923} fill="#F6F1E8" />
      <Circle cx={17.1922} cy={16.1923} r={5.19231} fill="black" />
      <Path
        d="M30.4188 14.5L30.4999 14.9521V16.9287L30.41 17.5H20.4999V14.5H30.4188Z"
        fill="#460812"
        stroke="black"
      />
      <Rect x={19.9999} y={14.8984} width={11.27} height={2.04166} fill="#460812" />
      <Circle cx={17.1153} cy={16.1154} r={3.11538} fill="#F6F1E8" />
      <Rect x={2.49988} y={0.5} width={31} height={31} stroke="black" />
      <Rect x={4.49988} y={2.5} width={27} height={27} stroke="black" />
    </Svg>
  );
}
