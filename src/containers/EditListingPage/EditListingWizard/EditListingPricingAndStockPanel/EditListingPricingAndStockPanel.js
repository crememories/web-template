import React, { useState } from 'react';
import PropTypes, { arrayOf, number, oneOf, shape } from 'prop-types';
import classNames from 'classnames';

// Import configs and util modules
import { FormattedMessage } from '../../../../util/reactIntl';
import { LISTING_STATE_DRAFT, STOCK_INFINITE_ITEMS, STOCK_TYPES } from '../../../../util/types';
import { types as sdkTypes } from '../../../../util/sdkLoader';

// Import shared components
import { H3, ListingLink } from '../../../../components';

// Import modules from this directory
import EditListingPricingAndStockForm from './EditListingPricingAndStockForm';
import css from './EditListingPricingAndStockPanel.module.css';

const { Money } = sdkTypes;
const BILLIARD = 1000000000000000;

const getListingTypeConfig = (publicData, listingTypes) => {
  const selectedListingType = publicData.listingType;
  return listingTypes.find(conf => conf.listingType === selectedListingType);
};

const getInitialValues = props => {
  const { listing, listingTypes } = props;
  const isPublished = listing?.id && listing?.attributes?.state !== LISTING_STATE_DRAFT;
  const price = listing?.attributes?.price;
  const currentStock = listing?.currentStock;

  const publicData = listing?.attributes?.publicData;
  const listingTypeConfig = getListingTypeConfig(publicData, listingTypes);
  const hasInfiniteStock = STOCK_INFINITE_ITEMS.includes(listingTypeConfig?.stockType);

  // The listing resource has a relationship: `currentStock`,
  // which you should include when making API calls.
  // Note: infinite stock is refilled to billiard using "stockUpdateMaybe"
  const currentStockQuantity = currentStock?.attributes?.quantity;
  const stock =
    currentStockQuantity != null
      ? currentStockQuantity
      : isPublished
      ? 0
      : hasInfiniteStock
      ? BILLIARD
      : 1;
  const stockTypeInfinity = [];

  const priceDescription = publicData.priceDescription;

  return { price, stock, stockTypeInfinity, priceDescription };
};

const EditListingPricingAndStockPanel = props => {
  // State is needed since re-rendering would overwrite the values during XHR call.
  const [state, setState] = useState({ initialValues: getInitialValues(props) });

  const {
    className,
    rootClassName,
    listing,
    marketplaceCurrency,
    listingMinimumPriceSubUnits,
    listingTypes,
    disabled,
    ready,
    onSubmit,
    submitButtonText,
    actionAddBtnText,
    panelUpdated,
    updateInProgress,
    errors,
  } = props;

  const classes = classNames(rootClassName || css.root, className);
  const initialValues = state.initialValues;

  // Form needs to know data from listingType
  const publicData = listing?.attributes?.publicData;
  const unitType = publicData.unitType;
  const listingTypeConfig = getListingTypeConfig(publicData, listingTypes);

  const hasInfiniteStock = STOCK_INFINITE_ITEMS.includes(listingTypeConfig?.stockType);

  const isPublished = listing?.id && listing?.attributes?.state !== LISTING_STATE_DRAFT;
  const priceCurrencyValid =
    marketplaceCurrency && initialValues.price instanceof Money
      ? initialValues.price?.currency === marketplaceCurrency
      : !!marketplaceCurrency;

  // configure already added variants 
  const variants = publicData.variants;
  const pricingVariant = [];
  const variantKeys = variants ? Object.keys(variants) : null;

  // const priceDescription = publicData.priceDescription;
  // initialValues.priceDescription = priceDescription;

  if (variantKeys && priceCurrencyValid) {
    // Initialize the pricingVariant array
    const pricingVariant = variantKeys.map(key => {
      const { variantLabel, variantPrice } = variants[key];
      
      // Create a Money instance for variantPrice
      const price = new Money();
      price.amount = variantPrice;
      price.currency = initialValues.price.currency;
  
      return { variantLabel, variantPrice: price };
    });
  
    // Update initialValues with the new pricingVariant
    initialValues.pricingVariant = pricingVariant;
  }

  const addonVariants = publicData.addons;
  const pricingAddonVariant = [];
  
  if (addonVariants && priceCurrencyValid) {
    Object.keys(addonVariants).forEach(key => {
      const { addonLabel, options = [] } = addonVariants[key];
  
      // Map addon options to structured data
      const addonOptions = options.map(({ optionLabel, subOptionLabel, price, options: subOptions = [] }) => {
        // Map sub-options and create Money objects for prices
        const optionPrice = new Money();
        optionPrice.amount = price;
        optionPrice.currency = initialValues.price.currency;
  
        const mappedSubOptions = subOptions.map(({ subOptionName, price }) => {
          const subOptionPrice = new Money();
          subOptionPrice.amount = price;
          subOptionPrice.currency = initialValues.price.currency;
  
          return { subOptionName, price: subOptionPrice };
        });
  
        return { optionLabel, subOptionLabel, price: optionPrice, options: mappedSubOptions };
      });
  
      // Push the structured addon data to pricingAddonVariant
      pricingAddonVariant.push({ addonLabel, options: addonOptions });
    });
  
    // Update initialValues with the structured addon variant data
    initialValues.addonVariant = pricingAddonVariant;
  }

  return (
    <div className={classes}>
      <H3 as="h1">
        {isPublished ? (
          <FormattedMessage
            id="EditListingPricingAndStockPanel.title"
            values={{ listingTitle: <ListingLink listing={listing} />, lineBreak: <br /> }}
          />
        ) : (
          <FormattedMessage
            id="EditListingPricingAndStockPanel.createListingTitle"
            values={{ lineBreak: <br /> }}
          />
        )}
      </H3>
      {priceCurrencyValid ? (
        <EditListingPricingAndStockForm
          className={css.form}
          initialValues={initialValues}
          onSubmit={values => {
            const { price, stock, stockTypeInfinity, priceDescription } = values;

            // configured options for add variant price with descriptions
            const variantsValues = values.pricingVariant;
            const variantsUpdate = {};
            
            if (typeof variantsValues === "object") {
              Object.keys(variantsValues).forEach((key) => {
                const { variantPrice, variantLabel } = variantsValues[key];
                
                // Only update if the variantPrice and its amount are valid
                if (variantPrice?.amount) {
                  variantsUpdate[key] = { variantPrice: variantPrice.amount, variantLabel };
                }
              });
            }
            
            // configured options for add variant price with descriptions
            const addonVariantsValues = values.addonVariant;
            const addonVariantsUpdate = {};

            if (typeof addonVariantsValues === "object") {
              const addonVariantKeys = Object.keys(addonVariantsValues);

              addonVariantKeys.forEach((addonKey) => {
                const curAddon = addonVariantsValues[addonKey];
                
                // If the addon has a valid label and options
                if (curAddon.addonLabel && curAddon.options) {
                  const addonLabel = curAddon.addonLabel;
                  
                  // Process each option within the addon
                  const optionsUpdate = curAddon.options.map((option) => {
                    const optionLabel = option.optionLabel;
                    const subOptionLabel = option.subOptionLabel;
                    const optionPrice = option.price.amount;
                    
                    // Process each subOption within the option
                    const subOptionsUpdate = option.options.map((subOption) => {
                      const subOptionName = subOption.subOptionName;
                      const subOptionPrice = subOption.price.amount;

                      return { subOptionName, price: subOptionPrice };
                    });

                    return { optionLabel, subOptionLabel, price: optionPrice, options: subOptionsUpdate };
                  });

                  // Update the addonVariant structure with the new data
                  addonVariantsUpdate[addonKey] = { addonLabel, options: optionsUpdate };
                }
              });
            }

            // Update stock only if the value has changed, or stock is infinity in stockType,
            // but not current stock is a small number (might happen with old listings)
            // NOTE: this is going to be used on a separate call to API
            // in EditListingPage.duck.js: sdk.stock.compareAndSet();

            const hasStockTypeInfinityChecked = stockTypeInfinity?.[0] === 'infinity';
            const hasNoCurrentStock = listing?.currentStock?.attributes?.quantity == null;
            const hasStockQuantityChanged = stock && stock !== initialValues.stock;
            // currentStockQuantity is null or undefined, return null - otherwise use the value
            const oldTotal = hasNoCurrentStock ? null : initialValues.stock;
            const stockUpdateMaybe =
              hasInfiniteStock && (hasNoCurrentStock || hasStockTypeInfinityChecked)
                ? {
                    stockUpdate: {
                      oldTotal,
                      newTotal: BILLIARD,
                    },
                  }
                : hasNoCurrentStock || hasStockQuantityChanged
                ? {
                    stockUpdate: {
                      oldTotal,
                      newTotal: stock,
                    },
                  }
                : {};

            // New values for listing attributes
            const updateValues = {
              price,
              ...stockUpdateMaybe,
              publicData: { variants:variantsUpdate, priceDescription, addons:addonVariantsUpdate },
            };

            console.log(updateValues);
            // Save the initialValues to state
            // Otherwise, re-rendering would overwrite the values during XHR call.
            setState({
              initialValues: {
                price,
                stock: stockUpdateMaybe?.stockUpdate?.newTotal || stock,
                stockTypeInfinity,
                priceDescription
              },
            });
            onSubmit(updateValues);
          }}
          listingMinimumPriceSubUnits={listingMinimumPriceSubUnits}
          marketplaceCurrency={marketplaceCurrency}
          listingType={listingTypeConfig}
          unitType={unitType}
          saveActionMsg={submitButtonText}
          variantLabel={actionAddBtnText}
          disabled={disabled}
          ready={ready}
          updated={panelUpdated}
          updateInProgress={updateInProgress}
          fetchErrors={errors}
        />
      ) : (
        <div className={css.priceCurrencyInvalid}>
          <FormattedMessage
            id="EditListingPricingAndStockPanel.listingPriceCurrencyInvalid"
            values={{ marketplaceCurrency }}
          />
        </div>
      )}
    </div>
  );
};

const { func, object, string, bool } = PropTypes;

EditListingPricingAndStockPanel.defaultProps = {
  className: null,
  rootClassName: null,
  listing: null,
};

EditListingPricingAndStockPanel.propTypes = {
  className: string,
  rootClassName: string,

  // We cannot use propTypes.listing since the listing might be a draft.
  listing: object,
  marketplaceCurrency: string.isRequired,
  listingMinimumPriceSubUnits: number.isRequired,
  listingTypes: arrayOf(
    shape({
      stockType: oneOf(STOCK_TYPES),
    })
  ).isRequired,

  disabled: bool.isRequired,
  ready: bool.isRequired,
  onSubmit: func.isRequired,
  submitButtonText: string.isRequired,
  panelUpdated: bool.isRequired,
  updateInProgress: bool.isRequired,
  errors: object.isRequired,
};

export default EditListingPricingAndStockPanel;
