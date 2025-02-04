import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import css from './IconMoreOptions.module.css';

const IconMoreOptions = props => {
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
      <path d="M6 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm10-2a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm10-2a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"></path>
    </svg>
  );
};

IconMoreOptions.defaultProps = { rootClassName: null, className: null };

const { string } = PropTypes;

IconMoreOptions.propTypes = { rootClassName: string, className: string };

export default IconMoreOptions;
