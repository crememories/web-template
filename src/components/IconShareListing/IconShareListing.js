import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import css from './IconShareListing.module.css';

const IconShareListing = props => {
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
      <path d="m27 18v9c0 1.1046-.8954 2-2 2h-18c-1.10457 0-2-.8954-2-2v-9m11-15v21m-10-11 9.2929-9.29289c.3905-.39053 1.0237-.39053 1.4142 0l9.2929 9.29289" fill="#fff"></path>
    </svg>
  );
};

IconShareListing.defaultProps = { rootClassName: null, className: null };

const { string } = PropTypes;

IconShareListing.propTypes = { rootClassName: string, className: string };

export default IconShareListing;
