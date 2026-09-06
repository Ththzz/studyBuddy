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
