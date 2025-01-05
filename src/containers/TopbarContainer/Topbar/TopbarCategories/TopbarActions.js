import React from 'react';
import { FormattedMessage } from 'react-intl';
import Switch from "react-switch";
import { SecondaryButtonInline } from '../../../../components';
import css from './TopbarCategories.module.css';

const TopbarActions = ({ searchModalOpen, isMapShow, handleShowMap }) => {
  const labelShowMapSwitcher = (isMapShow) => {
    return isMapShow ? 'Hide map' : 'Show map';
  };

  return (
    <div className={css.topbarActionsContainer}>
      <div className={css.searchModalButtonContainer}>
        <SecondaryButtonInline
          className={css.searchModalButton}
          type="submit"
          onClick={searchModalOpen}
        >
          <FormattedMessage
            id="SearchFiltersMobile.filtersButtonLabel"
            className={css.mapIconText}
          />
        </SecondaryButtonInline>
      </div>
      <div className={css.searchModalButtonContainer}>
        <label className={css.showMapSwitcher}>
          <span>{labelShowMapSwitcher(isMapShow)}</span>
          <span className={css.mapSwitcherContainer}>
            <Switch
              width={44}
              height={20}
              onColor={'#0095cd'}
              uncheckedIcon={false}
              checkedIcon={false}
              onChange={handleShowMap}
              checked={isMapShow}
            />
          </span>
        </label>
      </div>
    </div>
  );
};

export default TopbarActions;
