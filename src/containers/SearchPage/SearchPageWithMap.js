import React, { Component } from 'react';
import { array, arrayOf, bool, func, object, oneOf, shape, string } from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { useHistory, useLocation } from 'react-router-dom';
import debounce from 'lodash/debounce';
import omit from 'lodash/omit';
import classNames from 'classnames';

import { useIntl, intlShape, FormattedMessage } from '../../util/reactIntl';
import { useConfiguration } from '../../context/configurationContext';
import { useRouteConfiguration } from '../../context/routeConfigurationContext';

import { createResourceLocatorString, pathByRouteName } from '../../util/routes';
import {
  isAnyFilterActive,
  isMainSearchTypeKeywords,
  isOriginInUse,
  getQueryParamNames,
} from '../../util/search';
import { parse } from '../../util/urlHelpers';
import { propTypes } from '../../util/types';
import { getListingsById } from '../../ducks/marketplaceData.duck';
import { manageDisableScrolling, isScrollingDisabled } from '../../ducks/ui.duck';

import { H3, H5, ModalInMobile, Page, Modal, FooterSearch } from '../../components';
import TopbarContainer from '../../containers/TopbarContainer/TopbarContainer';
import FooterContainer from '../FooterContainer/FooterContainer';

import { setActiveListing } from './SearchPage.duck';
import {
  groupListingFieldConfigs,
  initialValues,
  searchParamsPicker,
  validUrlQueryParamsFromProps,
  validFilterParams,
  cleanSearchFromConflictingParams,
  createSearchResultSchema,
} from './SearchPage.shared';

import FilterComponent from './FilterComponent';
import SearchMap from './SearchMap/SearchMap';
import MainPanelHeader from './MainPanelHeader/MainPanelHeader';
import SearchHeader from './SearchHeader/SearchHeader';
import SearchHeaderMobile from './SearchHeader/SearchHeaderMobile';
import SearchFiltersSecondary from './SearchFiltersSecondary/SearchFiltersSecondary';
// import SearchFiltersPrimary from './SearchFiltersPrimary/SearchFiltersPrimary';
import SearchFiltersMobile from './SearchFiltersMobile/SearchFiltersMobile';
import SortBy from './SortBy/SortBy';
import SearchResultsPanel from './SearchResultsPanel/SearchResultsPanel';
import NoSearchResultsMaybe from './NoSearchResultsMaybe/NoSearchResultsMaybe';

import css from './SearchPage.module.css';

const MODAL_BREAKPOINT = 768; // Search is in modal on mobile layout
const SEARCH_WITH_MAP_DEBOUNCE = 300; // Little bit of debounce before search is initiated.

// Primary filters have their content in dropdown-popup.
// With this offset we move the dropdown to the left a few pixels on desktop layout.
const FILTER_DROPDOWN_OFFSET = -14;

export class SearchPageComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isSearchMapOpenOnMobile: false,
      isMobileModalOpen: false,
      currentQueryParams: validUrlQueryParamsFromProps(props),
      isSecondaryFiltersOpen: false,
      isFilterModalOpen: false,
      fullMap : false,
      isMapShow : false,
      showAction : false,
    };

    this.onMapMoveEnd = debounce(this.onMapMoveEnd.bind(this), SEARCH_WITH_MAP_DEBOUNCE);
    this.onOpenMobileModal = this.onOpenMobileModal.bind(this);
    this.onCloseMobileModal = this.onCloseMobileModal.bind(this);
    this.handleOpenFilterModal = this.handleOpenFilterModal.bind(this);
    this.handleCloseFilterModal = this.handleCloseFilterModal.bind(this);

    // Filter functions
    this.applyFilters = this.applyFilters.bind(this);
    this.cancelFilters = this.cancelFilters.bind(this);
    this.resetAll = this.resetAll.bind(this);
    this.getHandleChangedValueFn = this.getHandleChangedValueFn.bind(this);

    // SortBy
    this.handleSortBy = this.handleSortBy.bind(this);

    //map options
    this.changeMapSize = this.changeMapSize.bind(this);
    this.mapSizeEnableFullWidth = this.mapSizeEnableFullWidth.bind(this);
    this.mapSizeDisableFullWidth = this.mapSizeDisableFullWidth.bind(this);
    this.handleShowMap = this.handleShowMap.bind(this);
    this.updateShowAction = this.updateShowAction.bind(this);
  }

  // Callback to determine if new search is needed
  // when map is moved by user or viewport has changed
  onMapMoveEnd(viewportBoundsChanged, data) {
    const { viewportBounds, viewportCenter } = data;

    const routes = this.props.routeConfiguration;
    const searchPagePath = pathByRouteName('SearchPage', routes);
    const currentPath =
      typeof window !== 'undefined' && window.location && window.location.pathname;

    // When using the ReusableMapContainer onMapMoveEnd can fire from other pages than SearchPage too
    const isSearchPage = currentPath === searchPagePath;

    // If mapSearch url param is given
    // or original location search is rendered once,
    // we start to react to "mapmoveend" events by generating new searches
    // (i.e. 'moveend' event in Mapbox and 'bounds_changed' in Google Maps)
    if (viewportBoundsChanged && isSearchPage) {
      const { history, location, config } = this.props;
      const { listingFields: listingFieldsConfig } = config?.listing || {};
      const { defaultFilters: defaultFiltersConfig } = config?.search || {};

      // parse query parameters, including a custom attribute named category
      const { address, bounds, mapSearch, ...rest } = parse(location.search, {
        latlng: ['origin'],
        latlngBounds: ['bounds'],
      });

      const originMaybe = isOriginInUse(this.props.config) ? { origin: viewportCenter } : {};
      const dropNonFilterParams = false;

      const searchParams = {
        address,
        ...originMaybe,
        bounds: viewportBounds,
        mapSearch: true,
        ...validFilterParams(rest, listingFieldsConfig, defaultFiltersConfig, dropNonFilterParams),
      };

      history.push(createResourceLocatorString('SearchPage', routes, {}, searchParams));
    }
  }

  // Invoked when a modal is opened from a child component,
  // for example when a filter modal is opened in mobile view
  onOpenMobileModal() {
    this.setState({ isMobileModalOpen: true });
  }

  // Invoked when a modal is closed from a child component,
  // for example when a filter modal is opened in mobile view
  onCloseMobileModal() {
    this.setState({ isMobileModalOpen: false });
  }

  handleOpenFilterModal () {
    this.setState({ isFilterModalOpen: true });
  }
  
  handleCloseFilterModal () {
    this.setState({ isFilterModalOpen: false });
  }

  // Apply the filters by redirecting to SearchPage with new filters.
  applyFilters() {
    const { history, routeConfiguration, config } = this.props;
    const { listingFields: listingFieldsConfig } = config?.listing || {};
    const { defaultFilters: defaultFiltersConfig, sortConfig } = config?.search || {};

    const urlQueryParams = validUrlQueryParamsFromProps(this.props);
    const searchParams = { ...urlQueryParams, ...this.state.currentQueryParams };
    const search = cleanSearchFromConflictingParams(
      searchParams,
      listingFieldsConfig,
      defaultFiltersConfig,
      sortConfig
    );

    history.push(createResourceLocatorString('SearchPage', routeConfiguration, {}, search));
  }

  // Close the filters by clicking cancel, revert to the initial params
  cancelFilters() {
    this.setState({ currentQueryParams: {} });
  }

  // Reset all filter query parameters
  resetAll(e) {
    const { history, routeConfiguration, config } = this.props;
    const { listingFields: listingFieldsConfig } = config?.listing || {};
    const { defaultFilters: defaultFiltersConfig } = config?.search || {};

    const urlQueryParams = validUrlQueryParamsFromProps(this.props);
    const filterQueryParamNames = getQueryParamNames(listingFieldsConfig, defaultFiltersConfig);

    // Reset state
    this.setState({ currentQueryParams: {} });

    // Reset routing params
    const queryParams = omit(urlQueryParams, filterQueryParamNames);
    history.push(createResourceLocatorString('SearchPage', routeConfiguration, {}, queryParams));
  }

  getHandleChangedValueFn(useHistoryPush) {
    const { history, routeConfiguration, config } = this.props;
    const { listingFields: listingFieldsConfig } = config?.listing || {};
    const { defaultFilters: defaultFiltersConfig, sortConfig } = config?.search || {};

    const urlQueryParams = validUrlQueryParamsFromProps(this.props);

    return updatedURLParams => {
      const updater = prevState => {
        const { address, bounds, keywords } = urlQueryParams;
        const mergedQueryParams = { ...urlQueryParams, ...prevState.currentQueryParams };

        // Address and bounds are handled outside of MainPanel.
        // I.e. TopbarSearchForm && search by moving the map.
        // We should always trust urlQueryParams with those.
        // The same applies to keywords, if the main search type is keyword search.
        const keywordsMaybe = isMainSearchTypeKeywords(config) ? { keywords } : {};
        return {
          currentQueryParams: {
            ...mergedQueryParams,
            ...updatedURLParams,
            ...keywordsMaybe,
            address,
            bounds,
          },
        };
      };

      const callback = () => {
        if (useHistoryPush) {
          const searchParams = this.state.currentQueryParams;
          const search = cleanSearchFromConflictingParams(
            searchParams,
            listingFieldsConfig,
            defaultFiltersConfig,
            sortConfig
          );
          history.push(createResourceLocatorString('SearchPage', routeConfiguration, {}, search));
        }
      };

      this.setState(updater, callback);
    };
  }

  handleSortBy(urlParam, values) {
    const { history, routeConfiguration } = this.props;
    const urlQueryParams = validUrlQueryParamsFromProps(this.props);

    const queryParams = values
      ? { ...urlQueryParams, [urlParam]: values }
      : omit(urlQueryParams, urlParam);

    history.push(createResourceLocatorString('SearchPage', routeConfiguration, {}, queryParams));
  }

  changeMapSize  () {
    if(this.state.fullMap == true ){
      this.mapSizeDisableFullWidth();
    }else{
      this.mapSizeEnableFullWidth();
    }
  }

  mapSizeEnableFullWidth () {
    this.setState({ fullMap: true });
  }
  mapSizeDisableFullWidth () {
    this.setState({ fullMap: false });
  }

  handleShowMap(checked) {
    const { history, location, config, routeConfiguration } = this.props;

    this.setState({ isMapShow: checked });

    if(!checked){
      const { listingFields: listingFieldsConfig } = config?.listing || {};
      const { defaultFilters: defaultFiltersConfig } = config?.search || {};

      // parse query parameters, including a custom attribute named category
      const { mapSearch, ...rest } = parse(location.search, {
        latlng: ['origin'],
        latlngBounds: ['bounds'],
      });

      const searchParams = {
        ...validFilterParams(rest, listingFieldsConfig, defaultFiltersConfig),
      };

      history.push(createResourceLocatorString('SearchPage', routeConfiguration, {}, searchParams));
    }else{
      this.setState({ showAction: true });
    }
    
  }

  updateShowAction() {
    this.setState({ showAction: false });
  }

  // Reset all filter query parameters
  handleResetAll(e) {
    this.resetAll(e);

    // blur event target if event is passed
    if (e && e.currentTarget) {
      e.currentTarget.blur();
    }
  }

  render() {
    const {
      intl,
      listings,
      location,
      onManageDisableScrolling,
      pagination,
      scrollingDisabled,
      searchInProgress,
      searchListingsError,
      searchParams,
      activeListingId,
      onActivateListing,
      routeConfiguration,
      config,
    } = this.props;

    const { listingFields: listingFieldsConfig } = config?.listing || {};
    const { defaultFilters: defaultFiltersConfig, sortConfig } = config?.search || {};

    const activeListingTypes = config?.listing?.listingTypes.map(config => config.listingType);
    const marketplaceCurrency = config.currency;

    // Page transition might initially use values from previous search
    // urlQueryParams doesn't contain page specific url params
    // like mapSearch, page or origin (origin depends on config.maps.search.sortSearchByDistance)
    const { searchParamsAreInSync, urlQueryParams, searchParamsInURL } = searchParamsPicker(
      location.search,
      searchParams,
      listingFieldsConfig,
      defaultFiltersConfig,
      sortConfig,
      isOriginInUse(config)
    );

    const validQueryParams = validFilterParams(
      searchParamsInURL,
      listingFieldsConfig,
      defaultFiltersConfig,
      false
    );

    const isWindowDefined = typeof window !== 'undefined';
    const isMobileLayout = isWindowDefined && window.innerWidth < MODAL_BREAKPOINT;
    const shouldShowSearchMap =
      !isMobileLayout || (isMobileLayout && this.state.isSearchMapOpenOnMobile);

    const isKeywordSearch = isMainSearchTypeKeywords(config);
    const defaultFilters = isKeywordSearch
      ? defaultFiltersConfig.filter(f => f.key !== 'keywords')
      : defaultFiltersConfig;
    const [customPrimaryFilters, customSecondaryFilters] = groupListingFieldConfigs(
      listingFieldsConfig,
      activeListingTypes
    );
    const availablePrimaryFilters = [...customPrimaryFilters, ...defaultFilters];
    const availableFilters = [
      ...customPrimaryFilters,
      ...defaultFilters,
      ...customSecondaryFilters,
    ];

    const hasSecondaryFilters = !!(customSecondaryFilters && customSecondaryFilters.length > 0);

    // Selected aka active filters
    const selectedFilters = validFilterParams(
      validQueryParams,
      listingFieldsConfig,
      defaultFiltersConfig
    );
    const keysOfSelectedFilters = Object.keys(selectedFilters);
    const selectedFiltersCountForMobile = isKeywordSearch
      ? keysOfSelectedFilters.filter(f => f !== 'keywords').length
      : keysOfSelectedFilters.length;
    const isValidDatesFilter =
      searchParamsInURL.dates == null ||
      (searchParamsInURL.dates != null && searchParamsInURL.dates === selectedFilters.dates);

    // Selected aka active secondary filters
    const selectedSecondaryFilters = hasSecondaryFilters
      ? validFilterParams(validQueryParams, customSecondaryFilters, [])
      : {};
    const selectedSecondaryFiltersCount = Object.keys(selectedSecondaryFilters).length;

    const isSecondaryFiltersOpen = !!hasSecondaryFilters && this.state.isSecondaryFiltersOpen;
    const propsForSecondaryFiltersToggle = hasSecondaryFilters
      ? {
          isSecondaryFiltersOpen: this.state.isSecondaryFiltersOpen,
          toggleSecondaryFiltersOpen: isOpen => {
            this.setState({ isSecondaryFiltersOpen: isOpen, currentQueryParams: {} });
          },
          selectedSecondaryFiltersCount,
        }
      : {};

    const hasPaginationInfo = !!pagination && pagination.totalItems != null;
    const totalItems =
      searchParamsAreInSync && hasPaginationInfo
        ? pagination.totalItems
        : pagination?.paginationUnsupported
        ? listings.length
        : 0;
    const listingsAreLoaded =
      !searchInProgress &&
      searchParamsAreInSync &&
      !!(hasPaginationInfo || pagination?.paginationUnsupported);

    const conflictingFilterActive = isAnyFilterActive(
      sortConfig.conflictingFilters,
      validQueryParams,
      listingFieldsConfig,
      defaultFiltersConfig
    );
    const sortBy = mode => {
      return sortConfig.active ? (
        <SortBy
          sort={validQueryParams[sortConfig.queryParamName]}
          isConflictingFilterActive={!!conflictingFilterActive}
          hasConflictingFilters={!!(sortConfig.conflictingFilters?.length > 0)}
          selectedFilters={selectedFilters}
          onSelect={this.handleSortBy}
          showAsPopup
          mode={mode}
          contentPlacementOffset={FILTER_DROPDOWN_OFFSET}
        />
      ) : null;
    };
    const noResultsInfo = (
      <NoSearchResultsMaybe
        listingsAreLoaded={listingsAreLoaded}
        totalItems={totalItems}
        location={location}
        resetAll={this.resetAll}
      />
    );

    const { bounds, origin } = searchParamsInURL || {};
    // console.log(searchParamsInURL);
    const { title, description, schema } = createSearchResultSchema(
      listings,
      searchParamsInURL || {},
      intl,
      routeConfiguration,
      config
    );

    // Set topbar class based on if a modal is open in
    // a child component
    const topbarClasses = this.state.isMobileModalOpen
      ? classNames(css.topbarBehindModal, css.topbar)
      : css.topbar;

    let onlyCategorries = {};
    config.listing.listingFields.map((list,key)=>{
      if(list.key == 'categories'){
        onlyCategorries = list;
        return list;
      }
    });

    const { enumOptions = [] } = onlyCategorries || {};

    const isFilterModalOpen = this.state.isFilterModalOpen;

    const mapSizeClass = this.state.fullMap ? css.mapSubFullwidth : css.mapSub;

    const searchResultContainer = this.state.isMapShow ? css.searchResultContainer : css.searchResultContainerWithoutMap;
    const mapPanel = this.state.isMapShow ? css.mapPanel : css.mapPanelHidden;

    // N.B. openMobileMap button is sticky.
    // For some reason, stickyness doesn't work on Safari, if the element is <button>
    return (
      <Page
        scrollingDisabled={scrollingDisabled}
        description={description}
        title={title}
        schema={schema}
      >
        <TopbarContainer
          rootClassName={topbarClasses}
          currentPage="SearchPage"
          currentSearchParams={urlQueryParams}
          categories={enumOptions}
          searchModalOpen={this.handleOpenFilterModal}
          handleShowMap={this.handleShowMap}
          isMapShow={this.state.isMapShow}
          routeConfiguration={routeConfiguration}
        />
        <div className={css.container}>
        <Modal 
            id='isFilterModal'
            isOpen={isFilterModalOpen}
            containerClassName={css.modalContainer}
            contentLabel="Minimal Modal Example"
            onManageDisableScrolling={onManageDisableScrolling}
            onClose={this.handleCloseFilterModal}
          >
            <div className={css.filterColumnContent}>
              {availableFilters.map(config => {
                return (
                  <FilterComponent
                    key={`SearchFiltersMobile.${config.key}`}
                    idPrefix="SearchFiltersMobile"
                    className={css.filter}
                    config={config}
                    marketplaceCurrency={marketplaceCurrency}
                    urlQueryParams={urlQueryParams}
                    initialValues={initialValues(this.props, this.state.currentQueryParams)}
                    getHandleChangedValueFn={this.getHandleChangedValueFn}
                    intl={intl}
                    liveEdit
                    showAsPopup={false}
                    isDesktop
                  />
                );
              })}
              <button className={css.resetAllButton} onClick={e => this.handleResetAll(e)}>
                <FormattedMessage id={'SearchFiltersMobile.resetAll'} />
              </button>
            </div>
          </Modal>
          <div className={searchResultContainer}>
            <SearchHeaderMobile
              className={css.searchHeaderMobile}
              urlQueryParams={urlQueryParams}
              categories={enumOptions}
              // history={history}
              routeConfiguration={routeConfiguration}
            >
            </SearchHeaderMobile>

            <SearchHeader
              className={css.searchHeader}
              urlQueryParams={urlQueryParams}
              categories={enumOptions}
              // history={history}
              routeConfiguration={routeConfiguration}
            >
            </SearchHeader>
             
            <SearchFiltersMobile
              className={css.searchFiltersMobileMap}
              urlQueryParams={validQueryParams}
              sortByComponent={sortBy('mobile')}
              listingsAreLoaded={listingsAreLoaded}
              resultsCount={totalItems}
              searchInProgress={searchInProgress}
              searchListingsError={searchListingsError}
              showAsModalMaxWidth={MODAL_BREAKPOINT}
              onMapIconClick={() => this.setState({ isSearchMapOpenOnMobile: true })}
              onManageDisableScrolling={onManageDisableScrolling}
              onOpenModal={this.onOpenMobileModal}
              onCloseModal={this.onCloseMobileModal}
              resetAll={this.resetAll}
              selectedFiltersCount={selectedFiltersCountForMobile}
              noResultsInfo={noResultsInfo}
              isMapVariant
            >
              {availableFilters.map(config => {
                return (
                  <FilterComponent
                    key={`SearchFiltersMobile.${config.scope || 'built-in'}.${config.key}`}
                    idPrefix="SearchFiltersMobile"
                    config={config}
                    marketplaceCurrency={marketplaceCurrency}
                    urlQueryParams={validQueryParams}
                    initialValues={initialValues(this.props, this.state.currentQueryParams)}
                    getHandleChangedValueFn={this.getHandleChangedValueFn}
                    intl={intl}
                    liveEdit
                    showAsPopup={false}
                  />
                );
              })}
            </SearchFiltersMobile>
            <MainPanelHeader
              className={css.mainPanelMapVariant}
              sortByComponent={sortBy('desktop')}
              isSortByActive={sortConfig.active}
              listingsAreLoaded={listingsAreLoaded}
              resultsCount={totalItems}
              searchInProgress={searchInProgress}
              searchListingsError={searchListingsError}
              noResultsInfo={noResultsInfo}
              propsForSecondaryFiltersToggle={propsForSecondaryFiltersToggle}
              availablePrimaryFilters={availablePrimaryFilters}
              config={config}
              marketplaceCurrency={marketplaceCurrency}
              validQueryParams={validQueryParams}
              initialValues={initialValues(this.props, this.state.currentQueryParams)}
              getHandleChangedValueFn={this.getHandleChangedValueFn}
              intl={intl}
              contentPlacementOffset={FILTER_DROPDOWN_OFFSET}
              handleShowMap={this.handleShowMap}
              isMapShow={this.state.isMapShow}
            >
            </MainPanelHeader>
            {isSecondaryFiltersOpen ? (
              <div className={classNames(css.searchFiltersPanel)}>
                <SearchFiltersSecondary
                  urlQueryParams={validQueryParams}
                  listingsAreLoaded={listingsAreLoaded}
                  applyFilters={this.applyFilters}
                  cancelFilters={this.cancelFilters}
                  resetAll={this.resetAll}
                  onClosePanel={() => this.setState({ isSecondaryFiltersOpen: false })}
                >
                  {customSecondaryFilters.map(config => {
                    return (
                      <FilterComponent
                        key={`SearchFiltersSecondary.${config.scope || 'built-in'}.${config.key}`}
                        idPrefix="SearchFiltersSecondary"
                        config={config}
                        marketplaceCurrency={marketplaceCurrency}
                        urlQueryParams={validQueryParams}
                        initialValues={initialValues(this.props, this.state.currentQueryParams)}
                        getHandleChangedValueFn={this.getHandleChangedValueFn}
                        intl={intl}
                        showAsPopup={false}
                      />
                    );
                  })}
                </SearchFiltersSecondary>
              </div>
            ) : (
              <div
                className={classNames(css.listingsForMapVariant, {
                  [css.newSearchInProgress]: !(listingsAreLoaded || searchListingsError),
                })}
              >
                {searchListingsError ? (
                  <H3 className={css.error}>
                    <FormattedMessage id="SearchPage.searchError" />
                  </H3>
                ) : null}
                {!isValidDatesFilter ? (
                  <H5>
                    <FormattedMessage id="SearchPage.invalidDatesFilter" />
                  </H5>
                ) : null}
                <SearchResultsPanel
                  className={css.searchListingsPanel}
                  listings={listings}
                  pagination={listingsAreLoaded ? pagination : null}
                  search={parse(location.search)}
                  setActiveListing={onActivateListing}
                  isMapVariant={this.state.isMapShow}
                  fullMap={this.state.fullMap}
                />
              </div>
            )}
          </div>
          <ModalInMobile
            className={mapPanel}
            id="SearchPage.map"
            isModalOpenOnMobile={this.state.isSearchMapOpenOnMobile}
            onClose={() => this.setState({ isSearchMapOpenOnMobile: false })}
            showAsModalMaxWidth={MODAL_BREAKPOINT}
            onManageDisableScrolling={onManageDisableScrolling}
            hideClose={true}
          >
            <div className={css.mapWrapper} data-testid="searchMapContainer">
              {shouldShowSearchMap ? (
                <SearchMap
                  reusableContainerClassName={mapSizeClass}
                  activeListingId={activeListingId}
                  bounds={bounds}
                  // center={origin}
                  isSearchMapOpenOnMobile={this.state.isSearchMapOpenOnMobile}
                  location={location}
                  listings={listings || []}
                  onMapMoveEnd={this.onMapMoveEnd}
                  changeMapSize={this.changeMapSize}
                  fullMap={this.state.fullMap}
                  onCloseAsModal={() => {
                    onManageDisableScrolling('SearchPage.map', false);
                  }}
                  messages={intl.messages}
                  showAction={this.state.showAction}
                  updateShowAction={this.updateShowAction}
                />
              ) : null}
            </div>
          </ModalInMobile>
        </div>
        <FooterSearch
          isMapShow={this.state.isMapShow}
          fullMap={this.state.fullMap}
          changeMapSize={this.changeMapSize}
          handleShowMap={this.handleShowMap}
          showMapMobile={() => this.setState({ isSearchMapOpenOnMobile: true })}
        />
        <FooterContainer />
      </Page>
    );
  }
}

SearchPageComponent.defaultProps = {
  listings: [],
  pagination: null,
  searchListingsError: null,
  searchParams: {},
  activeListingId: null,
};

SearchPageComponent.propTypes = {
  listings: array,
  onActivateListing: func.isRequired,
  onManageDisableScrolling: func.isRequired,
  pagination: propTypes.pagination,
  scrollingDisabled: bool.isRequired,
  searchInProgress: bool.isRequired,
  searchListingsError: propTypes.error,
  searchParams: object,

  // from useHistory
  history: shape({
    push: func.isRequired,
  }).isRequired,
  // from useLocation
  location: shape({
    search: string.isRequired,
  }).isRequired,

  // from useIntl
  intl: intlShape.isRequired,

  // from useConfiguration
  config: object.isRequired,

  // from useRouteConfiguration
  routeConfiguration: arrayOf(propTypes.route).isRequired,
};

const EnhancedSearchPage = props => {
  const config = useConfiguration();
  const routeConfiguration = useRouteConfiguration();
  const intl = useIntl();
  const history = useHistory();
  const location = useLocation();

  return (
    <SearchPageComponent
      config={config}
      routeConfiguration={routeConfiguration}
      intl={intl}
      history={history}
      location={location}
      {...props}
    />
  );
};

const mapStateToProps = state => {
  const {
    currentPageResultIds,
    pagination,
    searchInProgress,
    searchListingsError,
    searchParams,
    activeListingId,
  } = state.SearchPage;
  const listings = getListingsById(state, currentPageResultIds);

  return {
    listings,
    pagination,
    scrollingDisabled: isScrollingDisabled(state),
    searchInProgress,
    searchListingsError,
    searchParams,
    activeListingId,
  };
};

const mapDispatchToProps = dispatch => ({
  onManageDisableScrolling: (componentId, disableScrolling) =>
    dispatch(manageDisableScrolling(componentId, disableScrolling)),
  onActivateListing: listingId => dispatch(setActiveListing(listingId)),
});

// Note: it is important that the withRouter HOC is **outside** the
// connect HOC, otherwise React Router won't rerender any Route
// components since connect implements a shouldComponentUpdate
// lifecycle hook.
//
// See: https://github.com/ReactTraining/react-router/issues/4671
const SearchPage = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(EnhancedSearchPage);

export default SearchPage;
