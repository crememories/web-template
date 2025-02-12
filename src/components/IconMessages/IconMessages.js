import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import css from './IconMessages.module.css';

const IconMessages = props => {
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
      <path d="M2 0h28a2 2 0 0 1 2 2v28a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2z"></path>
      <path fill="#fff" d="M15.8 5.47c-6.4 0-11.6 4.32-11.6 9.66 0 3.39 2.14 6.52 5.63 8.27a9.16 9.16 0 0 1-2.02 2.83c1.71-.3 3.33-.93 4.7-1.85 1.07.27 2.18.4 3.29.4 6.4 0 11.6-4.32 11.6-9.65 0-5.34-5.2-9.66-11.6-9.66z"></path>
    </svg>
  );
};

IconMessages.defaultProps = { rootClassName: null, className: null };

const { string } = PropTypes;

IconMessages.propTypes = { rootClassName: string, className: string };

export default IconMessages;
