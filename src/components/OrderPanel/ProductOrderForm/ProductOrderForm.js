import React, { useEffect, useState } from 'react';
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
  variantId
}) => {
  // const stockReservationQuantity = Number.parseInt(quantity, 10);
  const deliveryMethodMaybe = deliveryMethod ? { deliveryMethod } : {};
  const isBrowser = typeof window !== 'undefined';
  const quantityInt = Number.parseInt(quantity, 10);
  
  const variantInt = variants?(Number.parseInt(variants[variantId-1]?variants[variantId-1]['variantStok']:null, 10)):0;

  const stockReservationQuantity = quantityInt ? quantityInt : variantInt ? variantInt: 0;

  if (
    isBrowser &&
    stockReservationQuantity &&
    (!displayDeliveryMethod || deliveryMethod) &&
    !fetchLineItemsInProgress
  ) {
    onFetchTransactionLineItems({
      orderData: { stockReservationQuantity, ...deliveryMethodMaybe, variantId },
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
    userPhoneMetaData,
    listingType
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
      });
    }
  }, []);

  // If form values change, update line-items for the order breakdown
  const handleOnChange = formValues => {
    const { quantity, deliveryMethod, variant: variantId } = formValues.values;
    if (mounted) {
      handleFetchLineItems({
        quantity,
        deliveryMethod,
        listingId,
        isOwnListing,
        fetchLineItemsInProgress,
        onFetchTransactionLineItems,
        variants,
        variantId
      });
    }
  };

  // In case quantity and deliveryMethod are missing focus on that select-input.
  // Otherwise continue with the default handleSubmit function.
  const handleFormSubmit = e => {
    const { quantity, deliveryMethod, variant } = values || {};

    if ((!quantity || quantity < 1) && !variant) {
      e.preventDefault();
      // Blur event will show validator message
      formApi.blur('quantity');
      formApi.focus('quantity');
    } else if (displayDeliveryMethod && !deliveryMethod) {
      e.preventDefault();
      // Blur event will show validator message
      formApi.blur('deliveryMethod');
      formApi.focus('deliveryMethod');
    } else {
      handleSubmit(e);
    }
  };

  const breakdownData = {};
  const showBreakdown =
    breakdownData && lineItems && !fetchLineItemsInProgress && !fetchLineItemsError;

  const showContactUser = typeof onContactUser === 'function';

  const onClickContactUser = e => {
    e.preventDefault();
    onContactUser();
  };

  const onClickContactUserPhone = e => {
    e.preventDefault();
    window.location.href = 'tel:' + userPhoneMetaData;

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
  const initialValues = { ...quantityMaybe, ...deliveryMethodMaybe };

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
