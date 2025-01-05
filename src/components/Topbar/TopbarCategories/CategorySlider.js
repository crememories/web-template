// CategorySlider.js
import React, { useState, useEffect } from 'react';
import { ScrollMenu, VisibilityContext } from 'react-horizontal-scrolling-menu';
import classNames from 'classnames';
import { IconArrowHead } from '../..'; // Adjust path to your actual icons

import css from './CategorySlider.module.css'; // Make sure to use the correct CSS file

// Define the Card component to render each category item
const Card = ({ onClick, variant, index, urlQueryParams }) => {
  const active = variant.option === urlQueryParams.pub_category ? classNames(css.categoryContainner, css.active) : css.categoryContainner;

  console.log(variant.Icon);

  return variant.option !== 'other' ? (
    <div key={index} className={active}>
      <div onClick={onClick} className={css.categoryLabel}>
        <variant.Icon />
        <div>{variant.label}</div>
      </div>
    </div>
  ) : null;
};

const CategorySlider = ({ categories, categoryAction, urlQueryParams }) => {
  // Left and right navigation rendering logic
  const renderLeftNav = () => {
    const { isFirstItemVisible, scrollPrev } = React.useContext(VisibilityContext);
    const show = isFirstItemVisible ? { display: 'none' } : { display: 'block' };

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

  const renderRightNav = () => {
    const { isLastItemVisible, scrollNext } = React.useContext(VisibilityContext);
    const show = isLastItemVisible ? { display: 'none' } : { display: 'block' };

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

  return (
    <div className={css.categoryScrollerContainner}>
      <ScrollMenu LeftArrow={renderLeftNav} RightArrow={renderRightNav}>
        {categories.map((variant, index) => (
          <Card
            variant={variant}
            key={index}
            onClick={() => categoryAction(variant.option)}
            index={index}
            urlQueryParams={urlQueryParams}
          />
        ))}
      </ScrollMenu>
    </div>
  );
};

export default CategorySlider;