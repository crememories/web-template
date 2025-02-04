import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import css from './IconEmail.module.css';

const IconEmail = props => {
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
      <path d="M32 2v28a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2C0 .9.9 0 2 0h28a2 2 0 0 1 2 2z"></path>
      <path fill="#fff" d="M7.01 9.1c-.17 0-.33.03-.48.09l3.01 3.1 3.05 3.15.05.07.1.09.08.09.18.19 2.61 2.68c.04.02.17.14.27.19.13.06.26.12.4.13.16 0 .31-.04.45-.11.1-.05.15-.12.27-.21l3.02-3.13 3.06-3.14 2.94-3.03a1.3 1.3 0 0 0-.62-.16zm-.92.38c-.32.3-.52.76-.52 1.28v10.17c0 .42.13.8.35 1.1l.42-.4 3.15-3.06 2.79-2.7-.06-.07-3.05-3.14L6.1 9.5zm20.33.1-2.98 3.08-3.04 3.14-.06.06 2.9 2.8 3.15 3.06.19.18c.17-.27.26-.6.26-.97V10.76c0-.46-.16-.88-.42-1.18zm-13.79 6.65-2.77 2.7L6.7 22l-.4.39c.21.13.45.22.71.22H25.4c.31 0 .6-.12.83-.31l-.2-.2-3.15-3.06-2.9-2.8-2.61 2.7c-.14.09-.24.19-.38.25-.22.1-.46.2-.7.19-.25 0-.5-.1-.71-.2-.11-.06-.17-.12-.3-.23z"></path>
    </svg>
  );
};

IconEmail.defaultProps = { rootClassName: null, className: null };

const { string } = PropTypes;

IconEmail.propTypes = { rootClassName: string, className: string };

export default IconEmail;
