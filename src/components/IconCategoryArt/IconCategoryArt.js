import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import css from './IconCategoryArt.module.css';

const IconCategoryArt = props => {
  const { rootClassName, className } = props;
  const classes = classNames(rootClassName || css.root, className);
  return (
    <svg 
      className={classes}
      xmlns="http://www.w3.org/2000/svg" 
      version="1.1" 
      x="0px" y="0px" 
      viewBox="-150 120 1480.000000 950.000000"
      space="preserve"
    >

<g transform="translate(0.000000,1080.000000) scale(0.100000,-0.100000)"
 stroke="none">

<path d="M5414 9759 c-440 -44 -753 -466 -670 -902 18 -95 66 -209 116 -281
l40 -57 -502 -602 c-276 -331 -506 -605 -512 -609 -6 -4 -559 -8 -1230 -8
-1348 0 -1278 3 -1395 -65 -102 -60 -178 -161 -212 -280 -21 -75 -21 -5695 0
-5770 45 -158 160 -279 312 -326 59 -19 164 -19 4132 -19 3368 0 4081 3 4122
14 78 21 149 61 208 119 57 55 87 105 118 196 18 52 19 142 19 2900 0 3067 3
2877 -51 2982 -54 108 -156 192 -277 229 -62 19 -95 20 -1291 20 l-1226 0 -86
103 c-132 157 -902 1080 -917 1099 -12 15 -9 23 16 60 47 69 90 161 114 245
18 62 22 103 21 203 0 112 -3 135 -31 221 -34 102 -77 176 -160 276 -149 178
-407 277 -658 252z m222 -324 c62 -18 158 -80 208 -135 67 -75 116 -202 116
-305 0 -192 -135 -374 -326 -439 -69 -23 -205 -21 -279 4 -273 94 -396 409
-258 662 55 100 180 196 283 217 30 6 64 13 75 15 30 7 124 -3 181 -19z m-423
-1147 c162 -81 425 -76 598 13 22 11 44 19 49 17 11 -4 840 -1001 840 -1010 0
-5 -540 -8 -1200 -8 -660 0 -1200 4 -1200 8 0 5 188 234 417 510 356 429 420
501 437 496 12 -4 38 -15 59 -26z m4367 -1315 c19 -12 44 -37 55 -55 20 -33
20 -51 20 -2848 0 -2797 0 -2815 -20 -2848 -11 -18 -36 -43 -55 -55 l-35 -22
-4045 0 c-4042 0 -4045 0 -4080 20 -21 12 -44 39 -57 65 l-23 44 0 2793 c0
2546 1 2796 16 2833 18 44 59 79 108 91 17 4 1842 6 4056 6 l4025 -2 35 -22z"/>
<path d="M2040 6358 c-27 -14 -50 -36 -62 -58 -17 -33 -18 -125 -18 -2228 0
-2423 -5 -2232 63 -2283 l32 -24 3442 0 3442 0 27 21 c15 11 37 33 48 48 l21
27 0 2209 0 2209 -21 27 c-11 15 -33 37 -48 48 l-27 21 -3428 3 -3427 2 -44
-22z m6690 -2228 c0 -1067 -2 -1940 -4 -1940 -3 0 -260 352 -573 782 -1607
2211 -1770 2434 -1804 2456 -28 20 -44 23 -92 20 -50 -4 -63 -9 -92 -39 -18
-19 -381 -511 -805 -1094 -424 -583 -775 -1061 -778 -1062 -4 -1 -144 192
-312 428 -168 237 -320 448 -339 470 -40 48 -78 69 -126 69 -85 0 -58 34 -817
-1030 -392 -548 -716 -995 -720 -993 -10 5 -11 3857 -1 3866 3 4 1459 7 3235
7 l3228 0 0 -1940z m-1878 105 c789 -1086 1487 -2050 1532 -2112 l38 -53
-1500 0 -1499 0 -322 449 c-176 247 -321 455 -321 462 0 17 1481 2050 1491
2047 4 -2 266 -358 581 -793z m-2705 -907 c185 -260 463 -648 616 -862 153
-214 276 -390 274 -392 -2 -2 -558 -3 -1236 -2 l-1232 3 531 745 c648 909 700
980 705 980 2 0 156 -213 342 -472z"/>
</g>
    </svg>
  );
};

IconCategoryArt.defaultProps = { rootClassName: null, className: null };

const { string } = PropTypes;

IconCategoryArt.propTypes = { rootClassName: string, className: string };

export default IconCategoryArt;