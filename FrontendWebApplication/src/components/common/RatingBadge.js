import React from 'react';
import PropTypes from 'prop-types';
import './ratingBadge.css';

/**
 * PUBLIC_INTERFACE
 * RatingBadge - Star-based rating display with accessible labelling.
 */
export default function RatingBadge({ rating = 0, outOf = 5, size = 'sm', ariaLabel }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const emptyStars = outOf - fullStars - (hasHalf ? 1 : 0);
  const label = ariaLabel || `Rating: ${rating} out of ${outOf}`;

  const Star = ({ type }) => {
    if (type === 'half') {
      return (
        <span aria-hidden="true" className="rb-star rb-star--half">★</span>
      );
    }
    if (type === 'empty') {
      return (
        <span aria-hidden="true" className="rb-star rb-star--empty">☆</span>
      );
    }
    return (
      <span aria-hidden="true" className="rb-star rb-star--full">★</span>
    );
  };

  return (
    <span className={`rb ${size}`} role="img" aria-label={label} title={label} tabIndex={0}>
      {Array.from({ length: fullStars }).map((_, i) => <Star key={`f-${i}`} type="full" />)}
      {hasHalf && <Star type="half" />}
      {Array.from({ length: emptyStars }).map((_, i) => <Star key={`e-${i}`} type="empty" />)}
    </span>
  );
}

RatingBadge.propTypes = {
  rating: PropTypes.number,
  outOf: PropTypes.number,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  ariaLabel: PropTypes.string
};
