import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import css from './IconPhoneCall.module.css';

const IconPhoneCall = props => {
  const { rootClassName, className } = props;
  console.log('className');
  console.log(className);
  const classes = classNames(rootClassName || css.root, className);
  return (
    <svg 
      className={classes}
      xmlns="http://www.w3.org/2000/svg" 
      version="1.1" 
      x="0px" y="0px" 
      viewBox="0 0 50 50"
      space="preserve"
    >
      <g transform="translate(0,50) scale(0.1,-0.1)" stroke="none">
        <path xmlns="http://www.w3.org/2000/svg" d="M64 436 c-19 -19 -34 -42 -34 -52 1 -103 251 -353 353 -354 23 0 87 62 87 84 0 9 -25 32 -55 53 -55 36 -56 36 -89 20 l-33 -15 -61 61 -60 62 16 32 c15 32 15 33 -21 88 -21 30 -44 55 -53 55 -9 0 -31 -15 -50 -34z"/>
      </g>
    </svg>
  );
};

IconPhoneCall.defaultProps = { rootClassName: null, className: null };

const { string } = PropTypes;

IconPhoneCall.propTypes = { rootClassName: string, className: string };

export default IconPhoneCall;
