import React from 'react';

interface CloverIconProps {
  size?: number;
  className?: string;
  color?: string;
}

/**
 * Three-Leaf Clover (세잎클로버 - 행복의 상징) SVG Icon
 */
export const CloverIcon: React.FC<CloverIconProps> = ({
  size = 20,
  className = '',
  color = '#4A7C59',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <g fill={color}>
        {/* Top Leaf */}
        <path d="M12 11.8C10.6 9.8 9.2 6.5 10.8 4.6C11.8 3.5 12.2 3.5 13.2 4.6C14.8 6.5 13.4 9.8 12 11.8Z" />
        <circle cx="10.8" cy="5.8" r="2.2" />
        <circle cx="13.2" cy="5.8" r="2.2" />

        {/* Bottom Left Leaf */}
        <path d="M11.8 12.2C9.8 10.8 6.5 9.4 4.6 11C3.5 12 3.5 12.4 4.6 13.4C6.5 15 9.8 13.6 11.8 12.2Z" />
        <circle cx="5.8" cy="11" r="2.2" />
        <circle cx="5.8" cy="13.4" r="2.2" />

        {/* Bottom Right Leaf */}
        <path d="M12.2 12.2C14.2 10.8 17.5 9.4 19.4 11C20.5 12 20.5 12.4 19.4 13.4C17.5 15 14.2 13.6 12.2 12.2Z" />
        <circle cx="18.2" cy="11" r="2.2" />
        <circle cx="18.2" cy="13.4" r="2.2" />

        {/* Center Node */}
        <circle cx="12" cy="12" r="2.5" />
      </g>
      {/* Curved Stem */}
      <path
        d="M12 13.5C12 16.5 11.2 19.5 9.5 22"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};
