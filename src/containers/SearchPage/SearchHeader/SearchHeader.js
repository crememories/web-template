import React from 'react';
import { bool, func, node, number, string } from 'prop-types';
import classNames from 'classnames';

import SearchFiltersPrimary from '../SearchFiltersPrimary/SearchFiltersPrimary';
import FilterComponent from '../FilterComponent';
import { ResponsiveImage, ImageFromFile } from '../../../components/';
import { createResourceLocatorString } from '../../../util/routes';
import { useHistory, useLocation } from 'react-router-dom';

import defaultConfig from '../../../config/configDefault';
// import TopbarCategories from './TopbarCategories/TopbarCategories';

import css from './SearchHeader.module.css';

import CategoryScroller from '../../TopbarContainer/Topbar/TopbarCategories/CategoryScroller'; // Import the new CategorySlider component

const SearchHeader = props => {
  const {
    rootClassName,
    className,
    children,
    categories,
    urlQueryParams,
    routeConfiguration

  } = props;

  const history = useHistory();

  const classes = classNames(rootClassName || css.root, className);

  // Now use routeConfiguration in the categoryAction function
  const categoryAction = (name) => {

    console.log(history);
    urlQueryParams.pub_categories = name;
    // Ensure to use routeConfiguration that was retrieved using the hook
    history.push(createResourceLocatorString('Home', routeConfiguration, {}, urlQueryParams));
  };

  return (
    <div className={classes}>
      <div className={css.desctopHeader}>
        <div className={css.lContainer}>
          <div className={css.mainImage}>
            <img src={defaultConfig.branding.searchImageleftMainURL} alt={'file.name'} className={css.mainImageImg} />
          </div>
          <div className={css.secondImage}>
            <img src={defaultConfig.branding.searchImageleftMainURL} alt={'file.name'} className={css.secondImageImg} />
          </div>
        </div>
        <div className={css.cContainer}>
          <div>
            <h2 className={css.title}>Get Outdoors</h2>
            <h2 className={css.title}>Without the Crowds</h2>
          </div>
          <div className={css.searchContainer}>
            <span>
             Discover and book exclusive access on private lands for your next outdoor experience.
            </span>
          </div>
          <CategoryScroller categories={categories} categoryAction={categoryAction} urlQueryParams={urlQueryParams} />
        </div>
        <div className={css.rContainer}>
          <div className={css.mainImage}>
            <img src={defaultConfig.branding.searchImageleftMainURL} alt={'file.name'} className={css.mainImageImg} />
          </div>
          <div className={css.secondImage}>
            <img src={defaultConfig.branding.searchImageleftMainURL} alt={'file.name'} className={css.secondImageImg} />
          </div>
        </div>
      </div>

      {/* {children} */}

    </div>
  );
};

SearchHeader.defaultProps = {
  rootClassName: null,
  className: null,
};

SearchHeader.propTypes = {
  rootClassName: string,
  className: string,
};

export default SearchHeader;
