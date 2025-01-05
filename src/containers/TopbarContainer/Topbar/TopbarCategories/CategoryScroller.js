import React, { useState, useEffect, useContext } from 'react';
import { ScrollMenu, VisibilityContext } from 'react-horizontal-scrolling-menu';
// import { IconArrowHead } from '../../../../components';
import classNames from 'classnames';
import css from './TopbarCategories.module.css';

import {
  Avatar,
  InlineTextButton,
  LinkedLogo,
  Menu,
  MenuLabel,
  MenuContent,
  MenuItem,
  NamedLink,
  SecondaryButtonInline,
  IconCategoryBoat,
  IconCategoryTest,
  IconCategoryJewerly,
  IconCategoryOmg,
  IconCategoryPlane,
  IconCategoryUrn,
  IconCategoryArt,
  IconCategoryTrees,
  IconCategoryBalloons,
  IconArrowHead,
} from '../../../../components';

// Helper function to return icons based on category name
const categoryImage = (name) => {
  switch (name) {
    case 'boat':
      return <IconCategoryBoat />;
    case 'jewelry':
      return <IconCategoryJewerly />;
    case 'omg':
      return <IconCategoryOmg />;
    case 'plane':
      return <IconCategoryPlane />;
    case 'urn':
      return <IconCategoryUrn />;
    case 'art':
      return <IconCategoryArt />;
    case 'trees':
      return <IconCategoryTrees />;
    case 'balloons':
      return <IconCategoryBalloons />;
    default:
      return <IconCategoryPlane />;
  }
};

const CategoryScroller = ({ categories, categoryAction, urlQueryParams }) => {
  const [categoryActionActive, setCategoryActionActive] = useState(false);

  const renderLeftNav = (onClick, scrolBar) => {
    const { isFirstItemVisible, scrollPrev } = useContext(VisibilityContext);
    const show = isFirstItemVisible ? { 'display': 'none' } : { 'display': 'block' };
    return (
      <div className={css.scrollerContainerLeft} style={show}>
        <button className={css.navLeft} onClick={() => scrollPrev()}>
          <div className={css.navArrowWrapper}>
            <IconArrowHead direction="left" size="small" className={css.arrowHead} />
          </div>
        </button>
      </div>
    );
  };

  const renderRightNav = (onClick, scrolBar) => {
    const { isLastItemVisible, scrollNext } = useContext(VisibilityContext);
    const show = isLastItemVisible ? { 'display': 'none' } : { 'display': 'block' };
    return (
      <div className={css.scrollerContainerRight} style={show}>
        <button disabled={isLastItemVisible} className={css.navRight} onClick={() => scrollNext()}>
          <div className={css.navArrowWrapper}>
            <IconArrowHead direction="right" size="small" className={css.arrowHead} />
          </div>
        </button>
      </div>
    );
  };

  const Card = ({ variant, onClick, index }) => {
    const active = variant.option == urlQueryParams.pub_categories ? classNames( css.categoryContainner, css.active) : css.categoryContainner ;
    // const active = variant.option == categoryActionActive ? classNames(css.categoryContainner, css.active) : css.categoryContainner;
    return variant.option !== 'other' ? (
      <div key={index} className={active}>
        <div onClick={onClick} className={css.categoryLabel}>
          {categoryImage(variant.option)}
          <div>{variant.label}</div>
        </div>
      </div>
    ) : null;
  };

  return (
    <div className={css.categoryIconsContainner}>
      <div className={css.categoryScrollerContainner}>
        <ScrollMenu LeftArrow={renderLeftNav} RightArrow={renderRightNav}>
          {categories.map((variant, index) => (
            <Card
              variant={variant}
              key={index}
              onClick={() => categoryAction(variant.option)}
              index={index}
            />
          ))}
        </ScrollMenu>
      </div>
    </div>
  );
};

export default CategoryScroller;
