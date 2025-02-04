import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import css from './IconCopy.module.css';

const IconCopy = props => {
  const { rootClassName, className } = props;
  const classes = classNames(rootClassName || css.root, className);
  return (
    <svg 
      className={classes}
      xmlns="http://www.w3.org/2000/svg" 
      version="1.1" 
      viewBox="0 0 16 16"
      space="preserve"
    >
      <path d="M11.5 3A2.5 2.5 0 0 1 14 5.34v7.16a2.5 2.5 0 0 1-2.34 2.5H6.5A2.5 2.5 0 0 1 4 12.66V5.5A2.5 2.5 0 0 1 6.34 3h5.16zM12 .25v1.5H6a3.25 3.25 0 0 0-3.25 3.07V11h-1.5V5A4.75 4.75 0 0 1 5.78.25H12z"></path>
    </svg>
  );
};

IconCopy.defaultProps = { rootClassName: null, className: null };

const { string } = PropTypes;

IconCopy.propTypes = { rootClassName: string, className: string };

export default IconCopy;
