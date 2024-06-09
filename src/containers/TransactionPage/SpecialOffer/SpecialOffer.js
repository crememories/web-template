import React, { Component } from 'react';
import { arrayOf, bool, func, string } from 'prop-types';
import classNames from 'classnames';
import { Form as FinalForm } from 'react-final-form';

import { useRouteConfiguration } from '../../../context/routeConfigurationContext';

import { FormattedMessage } from '../../../util/reactIntl';
import { ensureCurrentUser } from '../../../util/data';
import { propTypes } from '../../../util/types';
import appSettings from '../../../config/settings';
import * as validators from '../../../util/validators';

import { Modal, Form, FieldTextInput, SecondaryButtonInline, FieldCurrencyInput } from '../../../components';
import { formatMoney } from '../../../util/currency';

import css from './SpecialOffer.module.css';

class SpecialOffer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showOfferModal: true,
    };
  }

  componentDidUpdate() {
    const { currentUser, specialOfferShowing } = this.props;
    const user = ensureCurrentUser(currentUser);

    // Show Special Offer Modal
    if (specialOfferShowing && !this.state.showOfferModal) {
      console.log('specialOfferShowing');
      this.setState({ showOfferModal: true });
    }
  }

  render() {
    const {
      rootClassName,
      className,
      containerClassName,
      currentUser,
      sendVerificationEmailInProgress,
      sendVerificationEmailError,
      onManageDisableScrolling,
      onResendVerificationEmail,
      specialOfferShowing,
      closeOfferModal,
      invalidListing,
      offerInProgress,
      intl,
    } = this.props;

    const user = ensureCurrentUser(currentUser);
    const classes = classNames(rootClassName || css.root, className);

    const getPriceValidators = (intl) => {
      const priceRequiredMsgId = { id: 'EditListingPricingAndStockForm.priceRequired' };
      const priceRequiredMsg = intl.formatMessage(priceRequiredMsgId);
      const priceRequired = validators.required(priceRequiredMsg);
    
      return priceRequired;
    };

       const  content = (
          <FinalForm
            {...this.props}
            render={formRenderProps => {
              const {
                rootClassName,
                className,
                messagePlaceholder,
                handleSubmit,
                inProgress,
                sendMessageError,
                invalid,
                form,
                formId,
                customer,
                listing,
                unitType,
                marketplaceCurrency,
              } = formRenderProps;

              const classes = classNames(rootClassName || css.root, className);
              const submitInProgress = inProgress;
              const submitDisabled = invalid || submitInProgress;
              const offerDisabled = invalidListing || offerInProgress
              const customerName = customer?.attributes?.profile?.displayName;
              const listingAttr = listing?.attributes;
              const price = listingAttr.price;

              const priceValidators = getPriceValidators(
                intl
              );

              return (
                <Form className={classes} onSubmit={values => handleSubmit(values, form)}>
                  <h4>
                    <FormattedMessage id="SpecialOffer.sendSpecialOfferTitle" values={{ custumer: customerName }} />
                  </h4>

                  <div className={css.offerDetails}>
                    <span >
                      <FormattedMessage id="SpecialOffer.sendSpecialOfferListing" />
                    </span>
                    <div className={css.offerTitle}>{listingAttr.title} <span className={css.inquiryPrice}>{formatMoney(intl, price)}</span></div>
                  </div>

                  <FieldCurrencyInput
                    id={`${formId}.price`}
                    name="price"
                    className={css.input}
                    label={intl.formatMessage(
                      { id: 'EditListingPricingAndStockForm.pricePerProduct' },
                      { unitType }
                    )}
                    placeholder={intl.formatMessage({
                      id: 'EditListingPricingAndStockForm.priceInputPlaceholder',
                    })}
                    currencyConfig={appSettings.getCurrencyFormatting(marketplaceCurrency)}
                    validate={priceValidators}
                  />
                  <div className={css.submitContainer}>
                    <div className={css.errorContainer}>
                      {sendMessageError ? (
                        <p className={css.error}>
                          <FormattedMessage id="SendMessageForm.sendFailed" />
                        </p>
                      ) : null}
                    </div>
                    
                    <SecondaryButtonInline
                      className={css.submitButton}
                      inProgress={submitInProgress}
                      disabled={submitDisabled}
                    >
                      <FormattedMessage id="SendMessageForm.sendSpecialOffer" />
                    </SecondaryButtonInline>
                  </div>
                </Form>
              );
            }}
          />
        );
  

    const closeButtonMessage = (
      <FormattedMessage id="ModalMissingInformation.closeVerifyEmailReminder" />
    );

    return (
      <Modal
        id="MissingInformationReminder"
        containerClassName={containerClassName}
        isOpen={!!specialOfferShowing}
        onClose={() => {
          closeOfferModal()
        }}
        usePortal
        onManageDisableScrolling={onManageDisableScrolling}
        closeButtonMessage={closeButtonMessage}
      >
        {content}
      </Modal>
    );
  }
}

SpecialOffer.defaultProps = {
  className: null,
  rootClassName: null,
  currentUser: null,
};

SpecialOffer.propTypes = {
  className: string,
  rootClassName: string,
  containerClassName: string,

  currentUser: propTypes.currentUser,
  onManageDisableScrolling: func.isRequired,
  onSubmit: func.isRequired,

};

const EnhancedSpecialOffer = props => {
  const routeConfiguration = useRouteConfiguration();

  return <SpecialOffer routeConfiguration={routeConfiguration} {...props} />;
};

export default EnhancedSpecialOffer;
