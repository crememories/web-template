import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import css from './IconCategoryBalloons.module.css';

const IconCategoryBalloons = props => {
  const { rootClassName, className } = props;
  const classes = classNames(rootClassName || css.root, className);
  return (
    <svg 
      className={classes}
      xmlns="http://www.w3.org/2000/svg" 
      version="1.1" 
      x="0px" y="0px" 
      viewBox="0 0 77.000000 69.000000"
      space="preserve"
    >

      <g xmlns="http://www.w3.org/2000/svg" transform="translate(0.000000,69.000000) scale(0.100000,-0.100000)" fillRule="evenodd">
        <path d="M283 649 c-78 -39 -123 -112 -123 -197 0 -40 11 -73 61 -173 38 -77 63 -141 65 -168 3 -25 10 -56 17 -70 11 -24 17 -26 82 -26 66 0 70 1 83 28 7 15 14 42 14 60 0 18 29 92 65 170 62 130 65 141 61 196 -5 71 -39 128 -100 168 -57 38 -163 44 -225 12z m87 -224 c1 -182 -1 -221 -12 -223 -10 -2 -21 22 -37 80 -43 157 -38 266 16 336 14 18 27 32 29 30 2 -2 4 -103 4 -223z m95 131 c25 -82 19 -151 -26 -318 -6 -22 -16 -38 -24 -38 -13 0 -15 35 -15 227 l0 226 25 -23 c14 -13 32 -46 40 -74z m-169 42 c-32 -66 -34 -188 -3 -301 23 -84 21 -111 -7 -88 -21 18 -97 188 -103 230 -7 55 33 138 84 174 21 15 41 27 44 27 4 0 -3 -19 -15 -42z m258 -36 c20 -28 30 -57 34 -91 4 -46 -1 -62 -49 -161 -31 -65 -59 -110 -67 -110 -11 0 -13 8 -9 28 3 15 15 70 26 123 17 79 19 106 10 158 -5 35 -16 76 -24 92 -8 15 -15 31 -15 34 0 16 68 -37 94 -73z m-184 -407 c0 -21 -5 -25 -29 -25 -26 0 -41 14 -41 41 0 5 16 9 35 9 31 0 35 -3 35 -25z m100 16 c0 -27 -15 -41 -41 -41 -24 0 -29 4 -29 25 0 22 4 25 35 25 19 0 35 -4 35 -9z m-10 -75 c0 -8 -4 -26 -10 -40 -9 -24 -15 -26 -64 -26 -60 0 -61 0 -71 48 l-7 32 76 0 c59 0 76 -3 76 -14z"/>
        <path d="M360 60 c0 -5 11 -10 25 -10 14 0 25 5 25 10 0 6 -11 10 -25 10 -14 0 -25 -4 -25 -10z"/>
      </g>

    </svg>
  );
};

IconCategoryBalloons.defaultProps = { rootClassName: null, className: null };

const { string } = PropTypes;

IconCategoryBalloons.propTypes = { rootClassName: string, className: string };

export default IconCategoryBalloons;


