import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import css from './IconMessenger.module.css';

const IconMessenger = props => {
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
      <path d="M30 0a2 2 0 0 1 2 2v28a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2z"></path>
      <path fill="#fff" d="M16 4c6.76 0 12 4.95 12 11.64s-5.24 11.64-12 11.64c-1.22 0-2.38-.16-3.48-.46a.96.96 0 0 0-.51 0l-.12.05-2.39 1.05a.96.96 0 0 1-1.33-.74l-.01-.11-.07-2.14a.97.97 0 0 0-.32-.68A11.39 11.39 0 0 1 4 15.64C4 8.95 9.24 4 16 4zm7.2 8.96c.33-.51-.25-1.09-.75-.8l-.07.04-3.79 2.87a.72.72 0 0 1-.76.07l-.1-.07-2.8-2.1a1.8 1.8 0 0 0-2.52.36l-.09.12-3.52 5.6c-.33.5.26 1.08.75.8l.07-.05 3.79-2.87a.72.72 0 0 1 .77-.07l.1.07 2.8 2.1a1.8 1.8 0 0 0 2.52-.36l.08-.12z"></path>
    </svg>
  );
};

IconMessenger.defaultProps = { rootClassName: null, className: null };

const { string } = PropTypes;

IconMessenger.propTypes = { rootClassName: string, className: string };

export default IconMessenger;
