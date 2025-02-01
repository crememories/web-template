import React from 'react';
import { bool, func, node, number, string } from 'prop-types';
import classNames from 'classnames';

import SearchFiltersPrimary from '../SearchFiltersPrimary/SearchFiltersPrimary';
import FilterComponent from '../FilterComponent';
import { ResponsiveImage, ImageFromFile } from '../../../components';
import { createResourceLocatorString } from '../../../util/routes';
import { useHistory, useLocation } from 'react-router-dom';

import { FormattedMessage } from '../../../util/reactIntl';

import defaultConfig from '../../../config/configDefault';
// import TopbarCategories from './TopbarCategories/TopbarCategories';

import css from './SearchHeaderMobile.module.css';

import CategoryScroller from '../../TopbarContainer/Topbar/TopbarCategories/CategoryScroller'; // Import the new CategorySlider component

const SearchHeaderMobile = props => {
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
        <div>
          <h2 className={css.title}><FormattedMessage id="SearchHeader.title" /></h2>
        </div>
        <div className={css.searchContainer}>
          <p>
            <FormattedMessage id="SearchHeader.subTitle" />
          </p>
        </div>
        <CategoryScroller categories={categories} categoryAction={categoryAction} urlQueryParams={urlQueryParams} />
      <div className={css.imagesConatiner}>
          <div className={css.imageWrapper}>
            {/* <span>
              <img src='data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%27100%27%20height=%27140%27/%3e'/>
            </span> */}
            <img src={defaultConfig.branding.searchImageleftMainURL} alt={'file.name'} className={css.leftImage} />
          </div>
          <div className={css.imageWrapper}>
            <img src={defaultConfig.branding.searchImagerightSecondaryURL} alt={'file.name'} className={css.middleImage} />
          </div>
          <div className={css.imageWrapper}>
            <img src={defaultConfig.branding.searchImagerightMainURL} alt={'file.name'} className={css.rightImage} />
          </div>
      </div>

      {children}

    </div>
  );
};

SearchHeaderMobile.defaultProps = {
  rootClassName: null,
  className: null,
};

SearchHeaderMobile.propTypes = {
  rootClassName: string,
  className: string,
};

export default SearchHeaderMobile;
