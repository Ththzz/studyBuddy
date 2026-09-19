import React from 'react';
import Svg, { Path } from 'react-native-svg';

const ICON_PATHS = {
  home: 'M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9.5Z M9 21v-6h6v6',
  quiz: 'M7 3h10a2 2 0 0 1 2 2v14H5V5a2 2 0 0 1 2-2Z M8 7h8M8 11h8M8 15h5',
  cards: 'M5 5h11a2 2 0 0 1 2 2v12H7a2 2 0 0 1-2-2V5Z M5 8H3v11a2 2 0 0 0 2 2h11',
  qa: 'M4 5h16v11H8l-4 4V5Z M8 9h8M8 12h5',
  chart: 'M4 19V5M4 19h17M8 16v-4M12 16V8M16 16V6M20 16v-3',
  bell: 'M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 22h4',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-14v5l3 2',
  check: 'm5 12 4 4L19 6',
  back: 'm15 18-6-6 6-6',
  pause: 'M8 5v14M16 5v14',
  play: 'm9 5 10 7-10 7V5Z',
  stop: 'M6 6h12v12H6z',
  upload: 'M12 16V4m0 0L7 9m5-5 5 5M5 15v4h14v-4',
  plus: 'M12 5v14M5 12h14',
  x: 'M6 6l12 12M18 6 6 18',
  chevron: 'm9 6 6 6-6 6',
  spark: 'm12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z M19 16l.6 2.4L22 19l-2.4.6L19 22l-.6-2.4L16 19l2.4-.6L19 16Z',
  search: 'm21 21-4.3-4.3M10.8 18a7.2 7.2 0 1 0 0-14.4 7.2 7.2 0 0 0 0 14.4Z',
};

export default function LineIcon({
  name,
  size = 20,
  color = '#438C31',
  strokeWidth = 1.8,
}) {
  const path = ICON_PATHS[name];

  if (!path) {
    return null;
  }

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      accessibilityElementsHidden
      importantForAccessibility="no"
    >
      <Path
        d={path}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
