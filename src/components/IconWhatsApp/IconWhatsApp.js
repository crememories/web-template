import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import css from './IconWhatsApp.module.css';

const IconWhatsApp = props => {
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
      <path fill="#fff" d="m4 28 1.7-6.16a11.82 11.82 0 0 1-1.6-5.95 11.94 11.94 0 0 1 20.4-8.4A11.8 11.8 0 0 1 28 15.9a11.94 11.94 0 0 1-17.67 10.45zm6.63-3.8a9.93 9.93 0 0 0 15.35-8.3A9.9 9.9 0 0 0 16.05 6a9.92 9.92 0 0 0-9.93 9.9c0 2.22.65 3.88 1.75 5.63l-1 3.64 3.76-.98zm11.36-5.52c-.07-.13-.27-.2-.57-.35-.3-.15-1.75-.86-2.03-.96-.27-.1-.46-.15-.66.15s-.77.96-.94 1.16-.35.22-.65.07c-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.48-1.75-1.65-2.04s-.02-.46.13-.6l.44-.52c.15-.17.2-.3.3-.5.1-.2.05-.36-.02-.51-.08-.15-.67-1.6-.92-2.2-.24-.57-.48-.5-.66-.5l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.03 1.01-1.03 2.46s1.06 2.86 1.2 3.06c.16.2 2.1 3.18 5.08 4.46.7.3 1.26.48 1.69.62.7.22 1.36.19 1.87.11.57-.08 1.75-.71 2-1.4s.25-1.28.17-1.4z"></path>
    </svg>
  );
};

IconWhatsApp.defaultProps = { rootClassName: null, className: null };

const { string } = PropTypes;

IconWhatsApp.propTypes = { rootClassName: string, className: string };

export default IconWhatsApp;
