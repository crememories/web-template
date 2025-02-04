import React, { useEffect, useState, useMemo } from 'react';

import { bool, func, number, string } from 'prop-types';
import { Form as FinalForm, FormSpy } from 'react-final-form';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { propTypes } from '../../../util/types';
import { numberAtLeast, required } from '../../../util/validators';
import { PURCHASE_PROCESS_NAME } from '../../../transactions/transaction';
import { formatMoney } from '../../../util/currency';

import {
  Form,
  FieldSelect,
  FieldTextInput,
  InlineTextButton,
  PrimaryButton,
  SecondaryButton,
  H3,
  H6,
} from '../../../components';

import { forEach } from 'lodash';
import EstimatedCustomerBreakdownMaybe from '../EstimatedCustomerBreakdownMaybe';
import { types as sdkTypes } from '../../../util/sdkLoader';
const { Money } = sdkTypes;

import css from './ProductOrderForm.module.css';

// Browsers can't render huge number of select options.
// (stock is shown inside select element)
// Note: input element could allow ordering bigger quantities
const MAX_QUANTITY_FOR_DROPDOWN = 100;

const handleFetchLineItems = ({
  quantity,
  deliveryMethod,
  displayDeliveryMethod,
  listingId,
  isOwnListing,
  fetchLineItemsInProgress,
  onFetchTransactionLineItems,
  variants,
  variantId,
  addonVariant
}) => {
  // const stockReservationQuantity = Number.parseInt(quantity, 10);
  const deliveryMethodMaybe = deliveryMethod ? { deliveryMethod } : {};
  const isBrowser = typeof window !== 'undefined';
  const quantityInt = Number.parseInt(quantity, 10);
  
  const variantInt = variants?(Number.parseInt(variants[variantId-1]?variants[variantId-1]['variantStok']:null, 10)):0;

  const stockReservationQuantity = quantityInt ? quantityInt : variantInt ? variantInt: 0;

  // console.log('stockReservationQuantity');
  // console.log(stockReservationQuantity);
  

  if (
    isBrowser &&
    stockReservationQuantity &&
    (!displayDeliveryMethod || deliveryMethod) &&
    !fetchLineItemsInProgress
  ) {
    onFetchTransactionLineItems({
      orderData: { stockReservationQuantity, ...deliveryMethodMaybe, variantId, addonVariant},
      listingId,
      isOwnListing,
    });
  }
};

const DeliveryMethodMaybe = props => {
  const {
    displayDeliveryMethod,
    hasMultipleDeliveryMethods,
    deliveryMethod,
    hasStock,
    formId,
    intl,
  } = props;
  const showDeliveryMethodSelector = displayDeliveryMethod && hasMultipleDeliveryMethods;
  const showSingleDeliveryMethod = displayDeliveryMethod && deliveryMethod;
  return !hasStock ? null : showDeliveryMethodSelector ? (
    <FieldSelect
      id={`${formId}.deliveryMethod`}
      className={css.deliveryField}
      name="deliveryMethod"
      label={intl.formatMessage({ id: 'ProductOrderForm.deliveryMethodLabel' })}
      validate={required(intl.formatMessage({ id: 'ProductOrderForm.deliveryMethodRequired' }))}
    >
      <option disabled value="">
        {intl.formatMessage({ id: 'ProductOrderForm.selectDeliveryMethodOption' })}
      </option>
      <option value={'pickup'}>
        {intl.formatMessage({ id: 'ProductOrderForm.pickupOption' })}
      </option>
      <option value={'shipping'}>
        {intl.formatMessage({ id: 'ProductOrderForm.shippingOption' })}
      </option>
    </FieldSelect>
  ) : showSingleDeliveryMethod ? (
    <div className={css.deliveryField}>
      <H3 rootClassName={css.singleDeliveryMethodLabel}>
        {intl.formatMessage({ id: 'ProductOrderForm.deliveryMethodLabel' })}
      </H3>
      <p className={css.singleDeliveryMethodSelected}>
        {deliveryMethod === 'shipping'
          ? intl.formatMessage({ id: 'ProductOrderForm.shippingOption' })
          : intl.formatMessage({ id: 'ProductOrderForm.pickupOption' })}
      </p>
      <FieldTextInput
        id={`${formId}.deliveryMethod`}
        className={css.deliveryField}
        name="deliveryMethod"
        type="hidden"
      />
    </div>
  ) : (
    <FieldTextInput
      id={`${formId}.deliveryMethod`}
      className={css.deliveryField}
      name="deliveryMethod"
      type="hidden"
    />
  );
};

const renderForm = formRenderProps => {
  const [mounted, setMounted] = useState(false);

  const {
    // FormRenderProps from final-form
    handleSubmit,
    form: formApi,

    // Custom props passed to the form component
    intl,
    formId,
    currentStock,
    allowOrdersOfMultipleItems,
    hasMultipleDeliveryMethods,
    displayDeliveryMethod,
    listingId,
    isOwnListing,
    onFetchTransactionLineItems,
    onContactUser,
    lineItems,
    fetchLineItemsInProgress,
    fetchLineItemsError,
    price,
    payoutDetailsWarning,
    marketplaceName,
    values,
    variants,
    addons,
    userPhoneMetaData,
    listingType,
    onClickContactUserPhone,
    addonVariant,
  } = formRenderProps;

  // Note: don't add custom logic before useEffect
  useEffect(() => {
    setMounted(true);

    // Side-effect: fetch line-items after mounting if possible
    const { quantity, deliveryMethod } = values;
    if (quantity && !formRenderProps.hasMultipleDeliveryMethods) {
      handleFetchLineItems({
        quantity,
        deliveryMethod,
        displayDeliveryMethod,
        listingId,
        isOwnListing,
        fetchLineItemsInProgress,
        onFetchTransactionLineItems,
        addonVariant
      });
    }
  }, []);

  // If form values change, update line-items for the order breakdown
  const handleOnChange = formValues => {
    const { quantity, deliveryMethod, variant: variantId, addonVariant } = formValues.values;
    if (mounted) {
      handleFetchLineItems({
        quantity,
        deliveryMethod,
        listingId,
        isOwnListing,
        fetchLineItemsInProgress,
        onFetchTransactionLineItems,
        variants,
        variantId,
        addonVariant
      });
    }
  };

  // In case quantity and deliveryMethod are missing focus on that select-input.
  // Otherwise continue with the default handleSubmit function.
  // const handleFormSubmit = e => {
  //   const { quantity, deliveryMethod, variant } = values || {};

  //   if ((!quantity || quantity < 1) && !variant) {
  //     e.preventDefault();
  //     // Blur event will show validator message
  //     formApi.blur('quantity');
  //     formApi.focus('quantity');
  //   } else if (displayDeliveryMethod && !deliveryMethod) {
  //     e.preventDefault();
  //     // Blur event will show validator message
  //     formApi.blur('deliveryMethod');
  //     formApi.focus('deliveryMethod');
  //   } else {
  //     handleSubmit(e);
  //   }
  // };

  const handleFormSubmit = e => {
    const { quantity, deliveryMethod, variant, addonVariant } = values || {};
    let valid = true;

    // Check if quantity is required and greater than 0, and if variant is selected
    if ((!quantity || quantity < 1) && !variant) {
      // e.preventDefault();  // Prevent form submission if validation fails
      formApi.blur('quantity');  // Trigger blur to show validation error
      formApi.focus('quantity'); // Focus the quantity field to highlight it
      valid = false;
    }
  
    // Validate delivery method if it's required and not provided
    if (displayDeliveryMethod && !deliveryMethod) {
      // e.preventDefault();  // Prevent form submission if validation fails
      formApi.blur('deliveryMethod');  // Trigger blur to show validation error
      formApi.focus('deliveryMethod'); // Focus the delivery method field
      valid = false;
    }
  
    // Validate addon options and suboptions
    if (addonVariant) {
      Object.keys(addonVariant).forEach((addonKey) => {
        const addon = addonVariant[addonKey];  // Each addon in addonVariant
        const selectedOption = addon?.option;

        // If no option is selected, show error
        if (selectedOption === undefined) {
          // e.preventDefault();  // Prevent form submission
          formApi.blur(`addonVariant.${addonKey}.option`);  // Trigger blur to show validation error
          formApi.focus(`addonVariant.${addonKey}.option`); // Focus the option field
          valid = false;
        }
      });
    }

    if(valid !== true) {
      e.preventDefault();  // Prevent form submission
      return;
    }
    // If all validation passes, submit the form
    handleSubmit(e);
  };

  const breakdownData = {};
  const showBreakdown =
    breakdownData && lineItems && !fetchLineItemsInProgress && !fetchLineItemsError;

  const showContactUser = typeof onContactUser === 'function';

  const onClickContactUser = e => {
    e.preventDefault();
    onContactUser();
  };

  const hasVarinats = (currentStock,variants) => {
    return !variants ? null : (()=>{
      const result = [];
      forEach(variants,(e,i)=>{
        currentStock ? result[i] = e : null;
      })
      return result.length ? result : null;
    })();
  }

  const formatVariantLabel = (intl,variant,price) => {
    const amount = variant.variantPrice;
    const variantPrice = new Money(amount,price.currency);

    return formatMoney(intl, variantPrice) +' '+ variant.variantLabel;
  }

  const hasAddonVariants = (currentStock, addonVariants) => {
    if (!addonVariants) return null;
  
    // Loop through the addonVariants to filter based on the condition (currentStock)
    return Object.values(addonVariants).map(addon => {
      // Filter options based on the currentStock
      const options = addon.options.filter(option => {
        // Add your custom condition based on currentStock or other criteria for each option
        return currentStock && option.price > 0; // Example condition: option should have price and currentStock should be true
      });
  
      // If there are valid options, return the addon with filtered options
      if (options.length > 0) {
        return { addonLabel: addon.addonLabel, options };
      }
  
      // If no valid options, return null
      return null;
    }).filter(addon => addon !== null); // Remove addons with no valid options
  };

  const contactSellerLink = (
    <InlineTextButton onClick={onClickContactUser}>
      <FormattedMessage id="ProductOrderForm.finePrintNoStockLinkText" />
    </InlineTextButton>
  );
  const quantityRequiredMsg = intl.formatMessage({ id: 'ProductOrderForm.quantityRequired' });

  // Listing is out of stock if currentStock is zero.
  // Undefined/null stock means that stock has never been set.
  const hasNoStockLeft = typeof currentStock != null && currentStock === 0;
  const hasStock = currentStock && currentStock > 0;
  const hasOneItemLeft = currentStock === 1;
  const selectableStock =
    currentStock > MAX_QUANTITY_FOR_DROPDOWN ? MAX_QUANTITY_FOR_DROPDOWN : currentStock;
  const quantities = hasStock ? [...Array(selectableStock).keys()].map(i => i + 1) : [];
  const variantsMap = hasStock ? hasVarinats(currentStock,variants) : null;

  const addonVariants = hasStock ? hasAddonVariants(currentStock,addons) : null;

  const submitInProgress = fetchLineItemsInProgress;
  const submitDisabled = !hasStock;

  return (
    <Form onSubmit={handleFormSubmit}>
      <FormSpy subscription={{ values: true }} onChange={handleOnChange} />

      {!variantsMap ? null : (
        
        <FieldSelect
          id={`${formId}.variant`}
          className={css.quantityField}
          name="variant"
          disabled={!hasStock}
          label={intl.formatMessage({ id: 'ProductOrderForm.quantityVariantLabel' })}
        >
          <option value="">
            {intl.formatMessage({ id: 'ProductOrderForm.selectQuantityVariantOption' })}
          </option>

          {variantsMap.map((variant,index) => (

            <option key={index++} value={index++}>
              {formatVariantLabel(intl,variant,price)}
            </option>
          ))}
        </FieldSelect>
      )}

      <div>
        {addonVariants &&
          Object.keys(addonVariants).map((addonKey) => {
            const addon = addonVariants[addonKey];
            const { addonLabel, options } = addon;

            // Get selected option and suboption for this addon from the state
            // const selectedAddon = selectedAddons[addonKey] || {};
            // const selectedOptionIndex = selectedAddon.option;
            // const selectedSubOptionIndex = selectedAddon.subOption;
            // let subOptionLabel = options[selectedOptionIndex]?.subOptionLabel || 'Select Suboption';

            return (
              <div key={addonKey}>
                {/* First Dropdown - Addon Options */}
                <FieldSelect
                  id={`${formId}.addonVariant.${addonKey}.option`}
                  className="quantityField"
                  name={`addonVariant.${addonKey}.option`}
                  disabled={!hasStock}
                  label={addonLabel}
                  // onChange={(e) => handleAddonOptionChange(addonKey, e)}
                  validate={(value) => {
                    if (value === undefined || value === "") {
                      return intl.formatMessage({ id: 'ProductOrderForm.required' });
                    }
                    return undefined;  // No error if a valid option is selected
                  }}
                >
                  <option value="">{intl.formatMessage({ id: 'ProductOrderForm.selectAddonVariantOption' }, { addonLabel })}</option>
                  {options.map((option, optionIndex) => (
                    <option key={optionIndex} value={optionIndex}>
                      {option.optionLabel}
                      {/* Display price only if there are no suboptions for this option */}
                      {option?.options?.length === 0 && (
                        ` - ${formatMoney(intl, new Money(option.price, price.currency))}`
                      )}
                    </option>
                  ))}
                </FieldSelect>

                {/* {selectedOptionIndex !== undefined && options[selectedOptionIndex]?.options?.length > 0 && (
                  <FieldSelect
                    id={`${formId}.addonVariant.${addonKey}.subOption`}
                    className="quantityField"
                    name={`addonVariant.${addonKey}.subOption`}
                    label={subOptionLabel}
                    onChange={(e) => handleSubOptionChange(addonKey, selectedOptionIndex, e)}
                    validate={(value) => {
                      if (value === undefined || value === "") {
                        return intl.formatMessage({ id: 'ProductOrderForm.required' });
                      }
                      return undefined;  // No error if a valid suboption is selected
                    }}
                  >
                    <option value="">{intl.formatMessage({ id: 'ProductOrderForm.selectAddonSubOption' }, { subOptionLabel })}</option>
                    {options[selectedOptionIndex].options.map((subOption, subOptionIndex) => (
                      <option key={subOptionIndex} value={subOptionIndex}>
                        {subOption.subOptionName} - {formatMoney(intl, new Money(subOption.price, price.currency))}
                      </option>
                    ))}
                  </FieldSelect>
                )} */}
              </div>
            );
          })}
      </div>

      {hasNoStockLeft ? null : hasOneItemLeft || !allowOrdersOfMultipleItems ? (
        <FieldTextInput
          id={`${formId}.quantity`}
          className={css.quantityField}
          name="quantity"
          type="hidden"
          validate={numberAtLeast(quantityRequiredMsg, 1)}
        />
      ) : (
        <FieldSelect
          id={`${formId}.quantity`}
          className={css.quantityField}
          name="quantity"
          disabled={!hasStock}
          label={intl.formatMessage({ id: 'ProductOrderForm.quantityLabel' })}
          validate={numberAtLeast(quantityRequiredMsg, 1)}
        >
          <option disabled value="">
            {intl.formatMessage({ id: 'ProductOrderForm.selectQuantityOption' })}
          </option>
          {quantities.map(quantity => (
            <option key={quantity} value={quantity}>
              {intl.formatMessage({ id: 'ProductOrderForm.quantityOption' }, { quantity })}
            </option>
          ))}
        </FieldSelect>
      )}

      <DeliveryMethodMaybe
        displayDeliveryMethod={displayDeliveryMethod}
        hasMultipleDeliveryMethods={hasMultipleDeliveryMethods}
        deliveryMethod={values?.deliveryMethod}
        hasStock={hasStock}
        formId={formId}
        intl={intl}
      />

      {showBreakdown ? (
        <div className={css.breakdownWrapper}>
          <H6 as="h3" className={css.bookingBreakdownTitle}>
            <FormattedMessage id="ProductOrderForm.breakdownTitle" />
          </H6>
          <hr className={css.totalDivider} />
          <EstimatedCustomerBreakdownMaybe
            breakdownData={breakdownData}
            lineItems={lineItems}
            currency={price.currency}
            marketplaceName={marketplaceName}
            processName={PURCHASE_PROCESS_NAME}
          />
        </div>
      ) : null}

      <div className={css.submitButton}>
        <PrimaryButton type="submit" inProgress={submitInProgress} disabled={submitDisabled}>
          {hasStock ? (
            <FormattedMessage id="ProductOrderForm.ctaButton" />
          ) : (
            <FormattedMessage id="ProductOrderForm.ctaButtonNoStock" />
          )}
        </PrimaryButton>
      </div>

      {userPhoneMetaData && listingType == 'boatListing' ? ( 
        <div className={css.contact}>
          <SecondaryButton
            onClick={onClickContactUserPhone}
            enforcePagePreloadFor="SignupPage"
          >
            <FormattedMessage id="ProductOrderForm.actionContactPhone" />
          </SecondaryButton>
        </div>)
      : null}

      <div className={css.contact}>
        <SecondaryButton
          onClick={onClickContactUser}
          enforcePagePreloadFor="SignupPage"
        >
          <FormattedMessage id="ProductOrderForm.askAQusetion" />
        </SecondaryButton>
      </div>
      
      <p className={css.finePrint}>
        {payoutDetailsWarning ? (
          payoutDetailsWarning
        ) : hasStock && isOwnListing ? (
          <FormattedMessage id="ProductOrderForm.ownListing" />
        ) : hasStock ? (
          <FormattedMessage id="ProductOrderForm.finePrint" />
        ) : showContactUser ? (
          <FormattedMessage id="ProductOrderForm.finePrintNoStock" values={{ contactSellerLink }} />
        ) : null}
      </p>
    </Form>
  );
};

const ProductOrderForm = props => {
  const intl = useIntl();
  const {
    price,
    currentStock,
    pickupEnabled,
    shippingEnabled,
    displayDeliveryMethod,
    allowOrdersOfMultipleItems,
    addons
  } = props;

  // Should not happen for listings that go through EditListingWizard.
  // However, this might happen for imported listings.
  if (displayDeliveryMethod && !pickupEnabled && !shippingEnabled) {
    return (
      <p className={css.error}>
        <FormattedMessage id="ProductOrderForm.noDeliveryMethodSet" />
      </p>
    );
  }

  const hasOneItemLeft = currentStock && currentStock === 1;
  const hasOneItemMode = !allowOrdersOfMultipleItems && currentStock > 0;
  const quantityMaybe = hasOneItemLeft || hasOneItemMode ? { quantity: '1' } : {};
  const deliveryMethodMaybe =
    shippingEnabled && !pickupEnabled
      ? { deliveryMethod: 'shipping' }
      : !shippingEnabled && pickupEnabled
      ? { deliveryMethod: 'pickup' }
      : !shippingEnabled && !pickupEnabled
      ? { deliveryMethod: 'none' }
      : {};
  const hasMultipleDeliveryMethods = pickupEnabled && shippingEnabled;

  // Conditionally initialize addonVariant under the key 'addonVariant' if addons are present
  const addonVariantMaybe = useMemo(() => {
    if (addons) {
      return {
        addonVariant: Object.keys(addons).reduce((acc, addonKey) => {
          acc[addonKey] = {
            option: undefined,  // Default value for option
          };
          return acc;
        }, []),
      };
    }
    return {}; // If no addons, return an empty object
  }, [addons]); // Recalculate only when 'addons' changes

  // const initialValues = { ...quantityMaybe, ...deliveryMethodMaybe };

  // Merge all initial values
  const initialValues = { 
    ...quantityMaybe, 
    ...deliveryMethodMaybe, 
    ...addonVariantMaybe 
  };

  return (
    <FinalForm
      initialValues={initialValues}
      hasMultipleDeliveryMethods={hasMultipleDeliveryMethods}
      displayDeliveryMethod={displayDeliveryMethod}
      {...props}
      intl={intl}
      render={renderForm}
    />
  );
};

ProductOrderForm.defaultProps = {
  rootClassName: null,
  className: null,
  price: null,
  currentStock: null,
  listingId: null,
  isOwnListing: false,
  pickupEnabled: false,
  shippingEnabled: false,
  displayDeliveryMethod: false,
  lineItems: null,
  fetchLineItemsError: null,
};

ProductOrderForm.propTypes = {
  rootClassName: string,
  className: string,

  marketplaceName: string.isRequired,

  // form
  formId: string.isRequired,
  onSubmit: func.isRequired,

  // listing
  listingId: propTypes.uuid,
  price: propTypes.money,
  currentStock: number,
  isOwnListing: bool,
  pickupEnabled: bool,
  shippingEnabled: bool,
  displayDeliveryMethod: bool,

  // line items
  lineItems: propTypes.lineItems,
  onFetchTransactionLineItems: func.isRequired,
  fetchLineItemsInProgress: bool.isRequired,
  fetchLineItemsError: propTypes.error,

  // other
  onContactUser: func,
};

export default ProductOrderForm;
