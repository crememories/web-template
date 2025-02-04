import React, { useState, useEffect } from 'react';
import { bool, func, object, number, string } from 'prop-types';
import classNames from 'classnames';

import Switch from "react-switch";
import { FormattedMessage, intlShape } from '../../../util/reactIntl';
import { AccessRole } from '../../../util/roles';
import { ACCOUNT_SETTINGS_PAGES } from '../../../routing/routeConfiguration';
import { useRouteConfiguration } from '../../../context/routeConfigurationContext';
import { propTypes } from '../../../util/types';
import { parse } from '../../../util/urlHelpers';
import { createResourceLocatorString } from '../../../util/routes';

import { Avatar, InlineTextButton, NamedLink, SecondaryButtonInline } from '../..';

import css from './TopbarCategories.module.css';
import CategorySlider from './CategorySlider'; // Import the new CategorySlider component

export const validUrlQueryParamsFromProps = (props) => {
  const { history } = props;
  const { ...searchInURL } = parse(history.location.search, {
    latlng: ['origin'],
    latlngBounds: ['bounds'],
  });

  return { ...searchInURL };
};

const TopbarCategories = (props) => {
  const {
    className,
    appConfig,
    currentUser,
    currentPage,
    rootClassName,
    currentUserHasListings,
    notificationCount,
    intl,
    isAuthenticated,
    onLogout,
    categories,
    searchModalOpen,
    history,
    handleShowMap,
    isMapShow,
  } = props;

  const [mounted, setMounted] = useState(false);
  const isAccess = AccessRole(props, 'admin');
  const urlQueryParams = validUrlQueryParamsFromProps(props);

  const categoryAction = (name) => {
    urlQueryParams.pub_category = name;
    history.push(createResourceLocatorString('Home', useRouteConfiguration(), {}, urlQueryParams));
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const marketplaceName = appConfig.marketplaceName;
  const classes = classNames(rootClassName || css.root, className);

  return (
    <nav className={classes}>
      <div className={css.categoryIconsContainner}>
        {/* Use the CategorySlider component here */}
        <CategorySlider
          categories={categories}
          categoryAction={categoryAction}
          urlQueryParams={urlQueryParams}
        />
      </div>
    </nav>
  );
};

TopbarCategories.propTypes = {
  rootClassName: string,
  className: string,
  currentUserHasListings: bool.isRequired,
  currentUser: propTypes.currentUser,
  currentPage: string,
  notificationCount: number,
  initialSearchFormValues: object,
  intl: intlShape.isRequired,
  appConfig: object,
};

export default TopbarCategories;
