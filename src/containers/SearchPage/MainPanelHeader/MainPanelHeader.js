import React from 'react';
import { bool, func, node, number, string } from 'prop-types';
import classNames from 'classnames';

import { FormattedMessage } from '../../../util/reactIntl';

import SearchFiltersPrimary from '../SearchFiltersPrimary/SearchFiltersPrimary';
import FilterComponent from '../FilterComponent';
import Switch from "react-switch";  // Keep the switch logic intact

import css from './MainPanelHeader.module.css';

const MainPanelHeader = props => {
  const {
    intl,
    rootClassName,
    className,
    children,
    sortByComponent,
    isSortByActive,
    listingsAreLoaded,
    resultsCount,
    searchInProgress,
    noResultsInfo,
    propsForSecondaryFiltersToggle,
    availablePrimaryFilters,
    marketplaceCurrency,
    initialValues,
    getHandleChangedValueFn,
    contentPlacementOffset,
    validQueryParams,
    handleShowMap,
    isMapShow
  } = props;

  const classes = classNames(rootClassName || css.root, className);

  const labelShowMApSwitcher = (isMapShow) => {
    if (isMapShow) {
      return 'Hide map';
    } else {
      return 'Show map';
    }
  };

  return (
    <div className={classes}>
      <div className={css.searchResultSummary}>
          <span className={css.resultsFound}>
            {searchInProgress ? (
              <FormattedMessage id="MainPanelHeader.loadingResults" />
            ) : (
              <FormattedMessage
                id="MainPanelHeader.foundResults"
                values={{ count: resultsCount }}
              />
            )}
          </span>
        </div>
      <div className={css.searchOptions}>
        <SearchFiltersPrimary {...propsForSecondaryFiltersToggle}>
          {availablePrimaryFilters.map(config => {
            return (
              <FilterComponent
                key={`SearchFiltersPrimary.${config.key}`}
                idPrefix="SearchFiltersPrimary"
                config={config}
                marketplaceCurrency={marketplaceCurrency}
                urlQueryParams={validQueryParams}
                initialValues={initialValues}
                getHandleChangedValueFn={getHandleChangedValueFn}
                intl={intl}
                showAsPopup
                contentPlacementOffset={contentPlacementOffset}
              />
            );
          })}
        </SearchFiltersPrimary>


        <div className={css.mapSwitcherWrapper}>
          {/* Map Show Switch */}
          <div className={css.searchModalButtonContainer}>
              <label className={css.showMapSwitcher}>
                <span>{labelShowMApSwitcher(isMapShow)}</span>
                <span className={css.mapSwitcherContainer}>
                  <Switch width={44} height={20} onColor={'#0095cd'} uncheckedIcon={false} checkedIcon={false} onChange={handleShowMap} checked={isMapShow} />
                </span>
              </label>
            </div>
        </div>  
        {isSortByActive ? (
          <div className={css.sortyByWrapper}>
            
            
            <span className={css.sortyBy}>
              <FormattedMessage id="MainPanelHeader.sortBy" />
            </span>
            {sortByComponent}
          </div>
        ) : null}
      </div>

      {children}

      {noResultsInfo ? noResultsInfo : null}
    </div>
  );
};

MainPanelHeader.defaultProps = {
  rootClassName: null,
  className: null,
  resultsCount: null,
  searchInProgress: false,
  sortByComponent: null,
};

MainPanelHeader.propTypes = {
  rootClassName: string,
  className: string,
  listingsAreLoaded: bool.isRequired,
  resultsCount: number,
  searchInProgress: bool,
  sortByComponent: node,
};

export default MainPanelHeader;
