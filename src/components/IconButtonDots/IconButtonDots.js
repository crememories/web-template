import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import css from './IconButtonDots.module.css';

const IconButtonDots = props => {
  const { rootClassName, className } = props;
  const classes = classNames(rootClassName || css.root, className);
  return (
    <svg 
    className={classes}
    xmlns="http://www.w3.org/2000/svg" 
    width="14"
    height="14"
    viewBox="0 0 16 16" 
    >
      <g fillRule="evenodd">
        <path d="M3 11.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-10-5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-10-5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"></path>
      </g>
    </svg>
  );
};

IconButtonDots.defaultProps = { rootClassName: null, className: null };

const { string } = PropTypes;

IconButtonDots.propTypes = { rootClassName: string, className: string };

export default IconButtonDots;
