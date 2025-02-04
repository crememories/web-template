import React, { useState, useEffect } from 'react';
import { bool, func, object, number, string } from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage, intlShape } from '../../../../util/reactIntl';
import { ACCOUNT_SETTINGS_PAGES } from '../../../../routing/routeConfiguration';
import { parse } from '../../../../util/urlHelpers';
import { propTypes } from '../../../../util/types';
import { Avatar, NamedLink, SecondaryButtonInline, Menu, MenuLabel, MenuContent, MenuItem, IconArrowHead } from '../../../../components';
import { useRouteConfiguration } from '../../../../context/routeConfigurationContext';
import { createResourceLocatorString } from '../../../../util/routes';

import TopbarSearchForm from '../TopbarSearchForm/TopbarSearchForm';
import CategoryScroller from './CategoryScroller';  // Import the new CategoryScroller component
import Switch from "react-switch";  // Keep the switch logic intact

import css from './TopbarCategories.module.css';
import './styles.css';
import './hideScrollBar.css';

export const validUrlQueryParamsFromProps = props => {
  const { history } = props;
  const { ...searchInURL } = parse(history.location.search, {
    latlng: ['origin'],
    latlngBounds: ['bounds'],
  });
  return { ...searchInURL };
};

const TopbarDesktop = props => {
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
    initialSearchFormValues,
    searchModalOpen,
    history,
    handleShowMap,
    isMapShow,
    categories,
  } = props;

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const marketplaceName = appConfig.marketplaceName;
  const authenticatedOnClientSide = mounted && isAuthenticated;

  const notificationDot = notificationCount > 0 ? <div className={css.notificationDot} /> : null;

  const inboxLink = authenticatedOnClientSide ? (
    <NamedLink
      className={css.inboxLink}
      name="InboxPage"
      params={{ tab: currentUserHasListings ? 'sales' : 'orders' }}
    >
      <span className={css.inbox}>
        <FormattedMessage id="TopbarDesktop.inbox" />
        {notificationDot}
      </span>
    </NamedLink>
  ) : null;

  const profileMenu = authenticatedOnClientSide ? (
    <Menu>
      <MenuLabel className={css.profileMenuLabel} isOpenClassName={css.profileMenuIsOpen}>
        <Avatar className={css.avatar} user={currentUser} disableProfileLink />
      </MenuLabel>
      <MenuContent className={css.profileMenuContent}>
        <MenuItem key="ManageListingsPage">
          <NamedLink className={css.yourListingsLink} name="ManageListingsPage">
            <FormattedMessage id="TopbarDesktop.yourListingsLink" />
          </NamedLink>
        </MenuItem>
        <MenuItem key="ProfileSettingsPage">
          <NamedLink className={css.profileSettingsLink} name="ProfileSettingsPage">
            <FormattedMessage id="TopbarDesktop.profileSettingsLink" />
          </NamedLink>
        </MenuItem>
        <MenuItem key="AccountSettingsPage">
          <NamedLink className={css.yourListingsLink} name="AccountSettingsPage">
            <FormattedMessage id="TopbarDesktop.accountSettingsLink" />
          </NamedLink>
        </MenuItem>
      </MenuContent>
    </Menu>
  ) : null;

  const routeConfiguration = useRouteConfiguration();

  const categoryAction = (name) => {
    const urlQueryParams = validUrlQueryParamsFromProps(props);
    urlQueryParams.pub_categories = name;
    history.push(createResourceLocatorString('Home', routeConfiguration, {}, urlQueryParams));
  };

  const labelShowMApSwitcher = (isMapShow) => {
    if (isMapShow) {
      return 'Hide map';
    } else {
      return 'Show map';
    }
  };

  return (
    <nav className={classNames(rootClassName || css.root, className)}>
      {/* Category Scroller Component */}
      {/* <CategoryScroller categories={categories} categoryAction={categoryAction} urlQueryParams={validUrlQueryParamsFromProps(props)} /> */}

      {/* Search Modal Button */}
      <div className={css.searchModalButtonContainer}>
        <SecondaryButtonInline
          className={css.searchModalButton}
          onClick={searchModalOpen}
        >
          <FormattedMessage id="SearchFiltersMobile.filtersButtonLabel" />
        </SecondaryButtonInline>
      </div>

      {/* Map Show Switch */}
      <div className={css.searchModalButtonContainer}>
        <label className={css.showMapSwitcher}>
          <span>{labelShowMApSwitcher(isMapShow)}</span>
          <span className={css.mapSwitcherContainer}>
            <Switch width={44} height={20} onColor={'#0095cd'} uncheckedIcon={false} checkedIcon={false} onChange={handleShowMap} checked={isMapShow} />
          </span>
        </label>
      </div>
    </nav>
  );
};

TopbarDesktop.defaultProps = {
  rootClassName: null,
  className: null,
  currentUser: null,
  currentPage: null,
  notificationCount: 0,
  initialSearchFormValues: {},
  appConfig: null,
};

TopbarDesktop.propTypes = {
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

export default TopbarDesktop;
