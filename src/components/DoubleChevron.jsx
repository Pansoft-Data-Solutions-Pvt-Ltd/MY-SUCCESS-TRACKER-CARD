import React from 'react';
import PropTypes from 'prop-types';
 
export default function DoubleChevronIcon({
    backgroundColor = '#5cb85c',
    orientation = 'up',
    size = 13
}) {
    // Calculate rotation based on orientation
    const rotations = {
        up: 0,
        down: 180,
        left: 270,
        right: 90
    };
 
    const rotation = rotations[orientation] || 0;
 
    return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 300 300"
      width={size}
      height={size}
      style={{ transform: `rotate(${rotation}deg)`, display: 'block' }}
    >
      <circle cx="150" cy="150" r="125" fill={backgroundColor} />
     
      <path
        d="M 95 145 L 150 90 L 205 145 L 185 165 L 150 130 L 115 165 Z"
        fill="white"
      />
     
      <path
        d="M 95 200 L 150 145 L 205 200 L 185 220 L 150 185 L 115 220 Z"
        fill="white"
      />
    </svg>
  );
}
 
DoubleChevronIcon.propTypes = {
    backgroundColor: PropTypes.string.isRequired,
    orientation: PropTypes.string.isRequired,
    size: PropTypes.number.isRequired
};