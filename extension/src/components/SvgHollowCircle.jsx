import React from 'react';
import PropTypes from 'prop-types';
 
export default function SvgHollowCircle({ color }){
    return <svg
  className="hollow-circle"
  width="14"
  height="14"
  viewBox="0 0 20 20"
>
  <circle
    cx="10"
    cy="10"
    r="8"
    fill="none"
    stroke={color}
    strokeWidth="3"
  />
</svg>
}
 
SvgHollowCircle.propTypes = {
    color: PropTypes.string.isRequired
};