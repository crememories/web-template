import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import css from './IconTwitter.module.css';

const IconTwitter = props => {
  const { rootClassName, className } = props;
  const classes = classNames(rootClassName || css.root, className);
  return (
    <svg 
      className={classes}
      xmlns="http://www.w3.org/2000/svg" 
      version="1.1" 
      viewBox="0 0 32 32"
      space="preserve"
    >
      <path d="m4 0h24c2.209139 0 4 1.790861 4 4v24c0 2.209139-1.790861 4-4 4h-24c-2.209139 0-4-1.790861-4-4v-24c0-2.209139 1.790861-4 4-4z"></path>
      <path d="m18.2761344 14.1623621 8.7424253-10.1623621h-2.071675l-7.5910467 8.8238362-6.0629468-8.8238362h-6.9928912l9.1683652 13.3432031-9.1683652 10.6567969h2.07179236l8.01634094-9.318271 6.4029159 9.318271h6.9928912l-9.5083148-13.8376379zm-2.8376036 3.2983977-.9289464-1.3286822-7.39129628-10.57246215h3.18215218l5.9648622 8.53231435.9289464 1.3286823 7.7536143 11.0907018h-3.1821522l-6.3271802-9.0500453z" fill="#fff"></path>
    </svg>
  );
};

IconTwitter.defaultProps = { rootClassName: null, className: null };

const { string } = PropTypes;

IconTwitter.propTypes = { rootClassName: string, className: string };

export default IconTwitter;
