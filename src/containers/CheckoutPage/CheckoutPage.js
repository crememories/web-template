import React, { useEffect, useState } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useIntl } from 'react-intl';

// Import contexts and util modules
import { useConfiguration } from '../../context/configurationContext';
import { useRouteConfiguration } from '../../context/routeConfigurationContext';
import { userDisplayNameAsString } from '../../util/data';
import { INQUIRY_PROCESS_NAME, resolveLatestProcessName } from '../../transactions/transaction';

// Import global thunk functions
import { isScrollingDisabled } from '../../ducks/ui.duck';
import { confirmCardPayment, retrievePaymentIntent } from '../../ducks/stripe.duck';
import { savePaymentMethod } from '../../ducks/paymentMethods.duck';

// Import shared components
import { NamedRedirect, Page } from '../../components';

// Session helpers file needs to be imported before CheckoutPageWithPayment and CheckoutPageWithInquiryProcess
import { storeData, clearData, handlePageData } from './CheckoutPageSessionHelpers';

// Import modules from this directory
import {
  initiateOrder,
  setInitialValues,
  speculateTransaction,
  stripeCustomer,
  confirmPayment,
  sendMessage,
  getCommission,
  initiateInquiryWithoutPayment,
} from './CheckoutPage.duck';

import CustomTopbar from './CustomTopbar';
import CheckoutPageWithPayment, {
  loadInitialDataForStripePayments,
} from './CheckoutPageWithPayment';
import CheckoutPageWithInquiryProcess from './CheckoutPageWithInquiryProcess';

const STORAGE_KEY = 'CheckoutPage';

const onSubmitCallback = () => {
  clearData(STORAGE_KEY);
};

const getProcessName = pageData => {
  const { transaction, listing } = pageData || {};
  const processName = transaction?.id
    ? transaction?.attributes?.processName
    : listing?.id
    ? listing?.attributes?.publicData?.transactionProcessAlias?.split('/')[0]
    : null;
  return resolveLatestProcessName(processName);
};

const EnhancedCheckoutPage = props => {
  const [pageData, setPageData] = useState({});
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const config = useConfiguration();
  const routeConfiguration = useRouteConfiguration();
  const intl = useIntl();
  const history = useHistory();

  useEffect(() => {
    const {
      orderData,
      listing,
      transaction,
      fetchSpeculatedTransaction,
      fetchStripeCustomer,
// <<<<<<< HEAD
//       fetchCommission,
//       history,
//       comissionValue
//     } = this.props;


//     // Fetch currentUser with stripeCustomer entity
//     // Note: since there's need for data loading in "componentWillMount" function,
//     //       this is added here instead of loadData static function.
//     fetchStripeCustomer();

//     // Browser's back navigation should not rewrite data in session store.
//     // Action is 'POP' on both history.back() and page refresh cases.
//     // Action is 'PUSH' when user has directed through a link
//     // Action is 'REPLACE' when user has directed through login/signup process
//     const hasNavigatedThroughLink = history.action === 'PUSH' || history.action === 'REPLACE';

//     const hasDataInProps = !!(orderData && listing && hasNavigatedThroughLink);
//     if (hasDataInProps) {
//       // Store data only if data is passed through props and user has navigated through a link.
//       storeData(orderData, listing, transaction, STORAGE_KEY);
//     }

//     // NOTE: stored data can be empty if user has already successfully completed transaction.
//     const pageData = hasDataInProps ? { orderData, listing, transaction } : storedData(STORAGE_KEY);
//     if(pageData?.listing?.id){
//       fetchCommission(pageData.listing.id);
//     }

//     const tx = pageData ? pageData.transaction : null;
//     const pageDataListing = pageData.listing;
//     const processName =
//       tx?.attributes?.processName ||
//       pageDataListing?.attributes?.publicData?.transactionProcessAlias?.split('/')[0];
//     const process = processName ? getProcess(processName) : null;

//     // If transaction has passed payment-pending state, speculated tx is not needed.
//     const shouldFetchSpeculatedTransaction =
//       !!pageData?.listing?.id &&
//       !!pageData.orderData &&
//       !!process &&
//       !txHasPassedPendingPayment(tx, process);

//     if (shouldFetchSpeculatedTransaction) {
//       const listingId = pageData.listing.id;
//       const processAlias = pageData.listing.attributes.publicData?.transactionProcessAlias;
//       const transactionId = tx ? tx.id : null;

//       const requestTransition =
//         tx?.attributes?.lastTransition === process.transitions.INQUIRE
//           ? process.transitions.REQUEST_PAYMENT_AFTER_INQUIRY
//           : process.transitions.REQUEST_PAYMENT;
//       const isPrivileged = process.isPrivileged(requestTransition);

//       // Fetch speculated transaction for showing price in order breakdown
//       // NOTE: if unit type is line-item/item, quantity needs to be added.
//       // The way to pass it to checkout page is through pageData.orderData
//       const quantity = pageData.orderData?.quantity;
//       const quantityMaybe = quantity ? { quantity } : {};
//       const deliveryMethod = pageData.orderData?.deliveryMethod;
//       const variant = pageData.orderData?.variant;
//       const variantMaybe = variant ? { variant } : {};
//       fetchSpeculatedTransaction(
//         {
//           listingId,
//           deliveryMethod,
//           ...quantityMaybe,
//           ...variantMaybe,
//           ...bookingDatesMaybe(pageData.orderData.bookingDates),
//         },
//         processAlias,
//         transactionId,
//         requestTransition,
//         isPrivileged
//       );
//     }

//     this.setState({ pageData: pageData || {}, dataLoaded: true });
//   }

//   handlePaymentIntent(handlePaymentParams, process) {
//     const {
//       currentUser,
//       stripeCustomerFetched,
//       onInitiateOrder,
//       onConfirmCardPayment,
//       onConfirmPayment,
//       onSendMessage,
//       onSavePaymentMethod,
//       config,
//       comissionValue
//     } = this.props;

//     const {
//       pageData,
//       message,
//       paymentIntent,
//       selectedPaymentMethod,
//       saveAfterOnetimePayment,
//       shippingDetails,
//     } = handlePaymentParams;
//     const storedTx = ensureTransaction(pageData.transaction);

//     const ensuredCurrentUser = ensureCurrentUser(currentUser);
//     const ensuredStripeCustomer = ensureStripeCustomer(ensuredCurrentUser.stripeCustomer);
//     const ensuredDefaultPaymentMethod = ensurePaymentMethodCard(
//       ensuredStripeCustomer.defaultPaymentMethod
//     );
//     const processAlias = pageData?.listing?.attributes?.publicData?.transactionProcessAlias;

//     let createdPaymentIntent = null;

//     const hasDefaultPaymentMethod = !!(
//       stripeCustomerFetched &&
//       ensuredStripeCustomer.attributes.stripeCustomerId &&
//       ensuredDefaultPaymentMethod.id
//     );
//     const stripePaymentMethodId = hasDefaultPaymentMethod
//       ? ensuredDefaultPaymentMethod.attributes.stripePaymentMethodId
//       : null;

//     const selectedPaymentFlow = paymentFlow(selectedPaymentMethod, saveAfterOnetimePayment);

//     // Step 1: initiate order by requesting payment from Marketplace API
//     const fnRequestPayment = fnParams => {
//       // fnParams should be { listingId, deliveryMethod, quantity?, bookingDates?, paymentMethod?.setupPaymentMethodForSaving?, protectedData }
//       const hasPaymentIntents = storedTx.attributes.protectedData?.stripePaymentIntents;

//       const requestTransition =
//         storedTx?.attributes?.lastTransition === process.transitions.INQUIRE
//           ? process.transitions.REQUEST_PAYMENT_AFTER_INQUIRY
//           : process.transitions.REQUEST_PAYMENT;
//       const isPrivileged = process.isPrivileged(requestTransition);

//       const commission = comissionValue && comissionValue.commission ? comissionValue.commission : false;

//       // If paymentIntent exists, order has been initiated previously.
//       return hasPaymentIntents
//         ? Promise.resolve(storedTx)
//         : onInitiateOrder(fnParams, processAlias, storedTx.id, requestTransition, isPrivileged, commission);
//     };

//     // Step 2: pay using Stripe SDK
//     const fnConfirmCardPayment = fnParams => {
//       // fnParams should be returned transaction entity

//       const order = ensureTransaction(fnParams);
//       if (order.id) {
//         // Store order.
//         const { orderData, listing } = pageData;
//         storeData(orderData, listing, order, STORAGE_KEY);
//         this.setState({ pageData: { ...pageData, transaction: order } });
//       }

//       const hasPaymentIntents = order.attributes.protectedData?.stripePaymentIntents;
//       if (!hasPaymentIntents) {
//         throw new Error(
//           `Missing StripePaymentIntents key in transaction's protectedData. Check that your transaction process is configured to use payment intents.`
//         );
//       }

//       const { stripePaymentIntentClientSecret } = hasPaymentIntents
//         ? order.attributes.protectedData.stripePaymentIntents.default
//         : null;

//       const { stripe, card, billingDetails, paymentIntent } = handlePaymentParams;
//       const stripeElementMaybe = selectedPaymentFlow !== USE_SAVED_CARD ? { card } : {};

//       // Note: For basic USE_SAVED_CARD scenario, we have set it already on API side, when PaymentIntent was created.
//       // However, the payment_method is save here for USE_SAVED_CARD flow if customer first attempted onetime payment
//       const paymentParams =
//         selectedPaymentFlow !== USE_SAVED_CARD
//           ? {
//               payment_method: {
//                 billing_details: billingDetails,
//                 card: card,
//               },
//             }
//           : { payment_method: stripePaymentMethodId };

//       const params = {
//         stripePaymentIntentClientSecret,
//         orderId: order.id,
//         stripe,
//         ...stripeElementMaybe,
//         paymentParams,
//       };

//       // If paymentIntent status is not waiting user action,
//       // confirmCardPayment has been called previously.
//       const hasPaymentIntentUserActionsDone =
//         paymentIntent && STRIPE_PI_USER_ACTIONS_DONE_STATUSES.includes(paymentIntent.status);
//       return hasPaymentIntentUserActionsDone
//         ? Promise.resolve({ transactionId: order.id, paymentIntent })
//         : onConfirmCardPayment(params);
//     };

//     // Step 3: complete order by confirming payment to Marketplace API
//     // Parameter should contain { paymentIntent, transactionId } returned in step 2
//     const fnConfirmPayment = fnParams => {
//       // Remember the created PaymentIntent for step 5
//       createdPaymentIntent = fnParams.paymentIntent;
//       const transactionId = fnParams.transactionId;
//       const transitionName = process.transitions.CONFIRM_PAYMENT;
//       return onConfirmPayment(transactionId, transitionName, {});
//     };

//     // Step 4: send initial message
//     const fnSendMessage = fnParams => {
//       return onSendMessage({ ...fnParams, message });
//     };

//     // Step 5: optionally save card as defaultPaymentMethod
//     const fnSavePaymentMethod = fnParams => {
//       const pi = createdPaymentIntent || paymentIntent;

//       if (selectedPaymentFlow === PAY_AND_SAVE_FOR_LATER_USE) {
//         return onSavePaymentMethod(ensuredStripeCustomer, pi.payment_method)
//           .then(response => {
//             if (response.errors) {
//               return { ...fnParams, paymentMethodSaved: false };
//             }
//             return { ...fnParams, paymentMethodSaved: true };
//           })
//           .catch(e => {
//             // Real error cases are catched already in paymentMethods page.
//             return { ...fnParams, paymentMethodSaved: false };
//           });
//       } else {
//         return Promise.resolve({ ...fnParams, paymentMethodSaved: true });
//       }
//     };

//     // Here we create promise calls in sequence
//     // This is pretty much the same as:
//     // fnRequestPayment({...initialParams})
//     //   .then(result => fnConfirmCardPayment({...result}))
//     //   .then(result => fnConfirmPayment({...result}))
//     const applyAsync = (acc, val) => acc.then(val);
//     const composeAsync = (...funcs) => x => funcs.reduce(applyAsync, Promise.resolve(x));
//     const handlePaymentIntentCreation = composeAsync(
//       fnRequestPayment,
//       fnConfirmCardPayment,
//       fnConfirmPayment,
//       fnSendMessage,
//       fnSavePaymentMethod
//     );

//     const quantity = pageData.orderData?.quantity;
//     const quantityMaybe = quantity ? { quantity } : {};
//     const deliveryMethod = pageData.orderData?.deliveryMethod;
//     const deliveryMethodMaybe = deliveryMethod ? { deliveryMethod } : {};
//     const shippingDetailsMaybe = shippingDetails ? { shippingDetails } : {};
//     const { listingType, unitType } = pageData?.listing?.attributes?.publicData || {};
//     const protectedDataMaybe = {
//       protectedData: {
//         ...transactionTypeDataMaybe(listingType, unitType, config),
//         ...deliveryMethodMaybe,
//         ...shippingDetailsMaybe,
//       },
//     };
//     const variant = pageData.orderData?.variant;
//     const variantMaybe = variant ? { variant } : {};
//     // Note: optionalPaymentParams contains Stripe paymentMethod,
//     // but that can also be passed on Step 2
//     // stripe.confirmCardPayment(stripe, { payment_method: stripePaymentMethodId })
//     const optionalPaymentParams =
//       selectedPaymentFlow === USE_SAVED_CARD && hasDefaultPaymentMethod
//         ? { paymentMethod: stripePaymentMethodId }
//         : selectedPaymentFlow === PAY_AND_SAVE_FOR_LATER_USE
//         ? { setupPaymentMethodForSaving: true }
//         : {};

//     const orderParams = {
//       listingId: pageData.listing.id,
//       deliveryMethod,
//       ...quantityMaybe,
//       ...variantMaybe,
//       ...bookingDatesMaybe(pageData.orderData.bookingDates),
//       ...protectedDataMaybe,
//       ...optionalPaymentParams,
//     };

//     return handlePaymentIntentCreation(orderParams);
//   }

//   handleSubmit(values, process) {
//     if (this.state.submitting) {
//       return;
//     }
//     this.setState({ submitting: true });

//     const {
//       history,
//       routeConfiguration,
//       speculatedTransaction,
//       currentUser,
//       paymentIntent,
//       dispatch,
//     } = this.props;
//     const { card, message, paymentMethod, formValues } = values;
//     const {
//       name,
//       addressLine1,
//       addressLine2,
//       postal,
//       city,
//       state,
//       country,
//       saveAfterOnetimePayment,
//       recipientName,
//       recipientPhoneNumber,
//       recipientAddressLine1,
//       recipientAddressLine2,
//       recipientPostal,
//       recipientCity,
//       recipientState,
//       recipientCountry,
//     } = formValues;

//     // Billing address is recommended.
//     // However, let's not assume that <StripePaymentAddress> data is among formValues.
//     // Read more about this from Stripe's docs
//     // https://stripe.com/docs/stripe-js/reference#stripe-handle-card-payment-no-element
//     const addressMaybe =
//       addressLine1 && postal
//         ? {
//             address: {
//               city: city,
//               country: country,
//               line1: addressLine1,
//               line2: addressLine2,
//               postal_code: postal,
//               state: state,
//             },
//           }
//         : {};
//     const billingDetails = {
//       name,
//       email: ensureCurrentUser(currentUser).attributes.email,
//       ...addressMaybe,
//     };

//     const shippingDetailsMaybe =
//       recipientName && recipientAddressLine1 && recipientPostal
//         ? {
//             shippingDetails: {
//               name: recipientName,
//               phoneNumber: recipientPhoneNumber,
//               address: {
//                 city: recipientCity,
//                 country: recipientCountry,
//                 line1: recipientAddressLine1,
//                 line2: recipientAddressLine2,
//                 postalCode: recipientPostal,
//                 state: recipientState,
//               },
//             },
//           }
//         : {};
//     const requestPaymentParams = {
//       pageData: this.state.pageData,
//       speculatedTransaction,
//       stripe: this.stripe,
//       card,
//       billingDetails,
//       message,
//       paymentIntent,
//       selectedPaymentMethod: paymentMethod,
//       saveAfterOnetimePayment:
//         Array.isArray(saveAfterOnetimePayment) && saveAfterOnetimePayment.length > 0,
//       ...shippingDetailsMaybe,
//     };

//     this.handlePaymentIntent(requestPaymentParams, process)
//       .then(res => {
//         const { orderId, messageSuccess, paymentMethodSaved } = res;
//         this.setState({ submitting: false });

//         const initialMessageFailedToTransaction = messageSuccess ? null : orderId;
//         const orderDetailsPath = pathByRouteName('OrderDetailsPage', routeConfiguration, {
//           id: orderId.uuid,
//         });
//         const initialValues = {
//           initialMessageFailedToTransaction,
//           savePaymentMethodFailed: !paymentMethodSaved,
//         };

//         initializeOrderPage(initialValues, routeConfiguration, dispatch);
//         clearData(STORAGE_KEY);
//         history.push(orderDetailsPath);
//       })
//       .catch(err => {
//         console.error(err);
//         this.setState({ submitting: false });
// =======
    } = props;
    const initialData = { orderData, listing, transaction };
    const data = handlePageData(initialData, STORAGE_KEY, history);
    setPageData(data || {});
    setIsDataLoaded(true);

    // This is for processes using payments with Stripe integration
    if (getProcessName(data) !== INQUIRY_PROCESS_NAME) {
      // Fetch StripeCustomer and speculateTransition for transactions that include Stripe payments
      loadInitialDataForStripePayments({
        pageData: data || {},
        fetchSpeculatedTransaction,
        fetchStripeCustomer,
        config,
// >>>>>>> 4521a03b43742766ce936df023e841c894cf4924
      });
    }
  }, []);

  const {
    currentUser,
    params,
    scrollingDisabled,
    speculateTransactionInProgress,
    onInquiryWithoutPayment,
  } = props;
  const processName = getProcessName(pageData);
  const isInquiryProcess = processName === INQUIRY_PROCESS_NAME;

  // Handle redirection to ListingPage, if this is own listing or if required data is not available
  const listing = pageData?.listing;
  const isOwnListing = currentUser?.id && listing?.author?.id?.uuid === currentUser?.id?.uuid;
  const hasRequiredData = !!(listing?.id && listing?.author?.id && processName);
  const shouldRedirect = isDataLoaded && !(hasRequiredData && !isOwnListing);

  // Redirect back to ListingPage if data is missing.
  // Redirection must happen before any data format error is thrown (e.g. wrong currency)
  if (shouldRedirect) {
    // eslint-disable-next-line no-console
    console.error('Missing or invalid data for checkout, redirecting back to listing page.', {
      listing,
    });
    return <NamedRedirect name="ListingPage" params={params} />;
  }

  const listingTitle = listing?.attributes?.title;
  const authorDisplayName = userDisplayNameAsString(listing?.author, '');
  const title = processName
    ? intl.formatMessage(
        { id: `CheckoutPage.${processName}.title` },
        { listingTitle, authorDisplayName }
      )
    : 'Checkout page is loading data';

// <<<<<<< HEAD
//     const { paymentIntent, onRetrievePaymentIntent } = this.props;
//     const tx = this.state.pageData ? this.state.pageData.transaction : null;

//     // We need to get up to date PI, if payment is pending but it's not expired.
//     const shouldFetchPaymentIntent =
//       this.stripe &&
//       !paymentIntent &&
//       tx &&
//       tx.id &&
//       process?.getState(tx) === process?.states.PAYMENT_PENDING &&
//       !checkIsPaymentExpired(tx, process);

//     if (shouldFetchPaymentIntent) {
//       const { stripePaymentIntentClientSecret } =
//         tx.attributes.protectedData?.stripePaymentIntents?.default || {};

//       // Fetch up to date PaymentIntent from Stripe
//       onRetrievePaymentIntent({ stripe, stripePaymentIntentClientSecret });
//     }
//   }

//   render() {
//     const {
//       scrollingDisabled,
//       speculateTransactionInProgress,
//       speculateTransactionError,
//       speculatedTransaction: speculatedTransactionMaybe,
//       initiateOrderError,
//       confirmPaymentError,
//       intl,
//       params,
//       currentUser,
//       confirmCardPaymentError,
//       paymentIntent,
//       retrievePaymentIntentError,
//       stripeCustomerFetched,
//       config,
//     } = this.props;

//     // Since the listing data is already given from the ListingPage
//     // and stored to handle refreshes, it might not have the possible
//     // deleted or closed information in it. If the transaction
//     // initiate or the speculative initiate fail due to the listing
//     // being deleted or closec, we should dig the information from the
//     // errors and not the listing data.
//     const listingNotFound =
//       isTransactionInitiateListingNotFoundError(speculateTransactionError) ||
//       isTransactionInitiateListingNotFoundError(initiateOrderError);

//     const { listing, transaction, orderData } = this.state.pageData;
//     const existingTransaction = ensureTransaction(transaction);
//     const speculatedTransaction = ensureTransaction(speculatedTransactionMaybe, {}, null);
//     const currentListing = ensureListing(listing);
//     const currentAuthor = ensureUser(currentListing.author);

//     const processName = existingTransaction.id
//       ? existingTransaction?.attributes?.processName
//       : listing?.id
//       ? listing.attributes.publicData?.transactionProcessAlias?.split('/')[0]
//       : null;
//     const latestProcessName = resolveLatestProcessName(processName);

//     const listingTitle = currentListing.attributes.title;
//     const title = latestProcessName
//       ? intl.formatMessage({ id: `CheckoutPage.${latestProcessName}.title` }, { listingTitle })
//       : 'Checkout page is loading data';

//     const pageProps = { title, scrollingDisabled };

//     const isLoading = !this.state.dataLoaded || speculateTransactionInProgress;

//     if (isLoading) {
//       return (
//         <Page {...pageProps}>
//           <CustomTopbar intl={intl} />
//         </Page>
//       );
//     }
//     const isOwnListing =
//       currentUser &&
//       currentUser.id &&
//       currentAuthor &&
//       currentAuthor.id &&
//       currentAuthor.id.uuid === currentUser.id.uuid;

//     const hasRequiredData = !!(currentListing.id && currentAuthor.id && processName);
//     const canShowPage = hasRequiredData && !isOwnListing;
//     const shouldRedirect = !isLoading && !canShowPage;

//     // Redirect back to ListingPage if data is missing.
//     // Redirection must happen before any data format error is thrown (e.g. wrong currency)
//     if (shouldRedirect) {
//       // eslint-disable-next-line no-console
//       console.error('Missing or invalid data for checkout, redirecting back to listing page.', {
//         transaction: speculatedTransaction,
//         listing,
//       });
//       return <NamedRedirect name="ListingPage" params={params} />;
//     }

//     // Show breakdown only when (speculated?) transaction is loaded
//     // (i.e. it has an id and lineItems)
//     const tx = existingTransaction.id ? existingTransaction : speculatedTransaction;
//     const timeZone = listing?.attributes?.availabilityPlan?.timezone;
//     const transactionProcessAlias = currentListing.attributes.publicData?.transactionProcessAlias;
//     const unitType = currentListing.attributes.publicData?.unitType;
//     const lineItemUnitType = `line-item/${unitType}`;
//     const dateType = lineItemUnitType === LINE_ITEM_HOUR ? DATE_TYPE_DATETIME : DATE_TYPE_DATE;
//     const txBookingMaybe = tx.booking?.id
//       ? { booking: ensureBooking(tx.booking), dateType, timeZone }
//       : {};
//     const breakdown =
//       tx.id && tx.attributes.lineItems?.length > 0 ? (
//         <OrderBreakdown
//           className={css.orderBreakdown}
//           userRole="customer"
//           transaction={tx}
//           {...txBookingMaybe}
//           currency={config.currency}
//           marketplaceName={config.marketplaceName}
//         />
//       ) : null;

//     const process = latestProcessName ? getProcess(latestProcessName) : null;
//     const transitions = process.transitions;
//     const isPaymentExpired = checkIsPaymentExpired(existingTransaction, process);
//     const hasDefaultPaymentMethod = !!(
//       stripeCustomerFetched &&
//       ensureStripeCustomer(currentUser.stripeCustomer).attributes.stripeCustomerId &&
//       ensurePaymentMethodCard(currentUser.stripeCustomer.defaultPaymentMethod).id
//     );

//     // Allow showing page when currentUser is still being downloaded,
//     // but show payment form only when user info is loaded.
//     const showPaymentForm = !!(
//       currentUser &&
//       hasRequiredData &&
//       !listingNotFound &&
//       !initiateOrderError &&
//       !speculateTransactionError &&
//       !retrievePaymentIntentError &&
//       !isPaymentExpired
//     );

//     const firstImage =
//       currentListing.images && currentListing.images.length > 0 ? currentListing.images[0] : null;

//     const {
//       aspectWidth = 1,
//       aspectHeight = 1,
//       variantPrefix = 'listing-card',
//     } = config.layout.listingImage;
//     const variants = firstImage
//       ? Object.keys(firstImage?.attributes?.variants).filter(k => k.startsWith(variantPrefix))
//       : [];

//     const listingLink = (
//       <NamedLink
//         name="ListingPage"
//         params={{ id: currentListing.id.uuid, slug: createSlug(listingTitle) }}
//       >
//         <FormattedMessage id="CheckoutPage.errorlistingLinkText" />
//       </NamedLink>
//     );

//     const {
//       listingNotFoundErrorMessage,
//       initiateOrderErrorMessage,
//       speculateErrorMessage,
//       speculateTransactionErrorMessage,
//     } = getErrorMessages(
//       listingNotFound,
//       initiateOrderError,
//       speculateTransactionError,
//       listingLink
//     );

//     let variantData = {};
//     const price = currentListing.attributes.price;
//     if(currentListing.attributes.publicData && currentListing.attributes.publicData.variants){
//       if(orderData.variant){
//         variantData = currentListing.attributes.publicData.variants[orderData.variant-1];
//         price.amount = variantData.variantPrice;
//       }
//     }
//     const detailsVariantSubTitle = variantData?variantData.variantLabel:null;

//     const showInitialMessageInput = !(
//       existingTransaction && existingTransaction.attributes.lastTransition === transitions.INQUIRE
//     );

//     // Get first and last name of the current user and use it in the StripePaymentForm to autofill the name field
//     const userName = currentUser?.attributes?.profile
//       ? `${currentUser.attributes.profile.firstName} ${currentUser.attributes.profile.lastName}`
//       : null;

//     // If paymentIntent status is not waiting user action,
//     // confirmCardPayment has been called previously.
//     const hasPaymentIntentUserActionsDone =
//       paymentIntent && STRIPE_PI_USER_ACTIONS_DONE_STATUSES.includes(paymentIntent.status);

//     // If your marketplace works mostly in one country you can use initial values to select country automatically
//     // e.g. {country: 'FI'}

//     const initalValuesForStripePayment = { name: userName, recipientName: userName };
//     const askShippingDetails =
//       orderData?.deliveryMethod === 'shipping' &&
//       !txHasPassedPendingPayment(existingTransaction, process);

//     return (
//       <Page {...pageProps}>
//         <CustomTopbar intl={intl} />
//         <div className={css.contentContainer}>
//           <AspectRatioWrapper
//             width={aspectWidth}
//             height={aspectHeight}
//             className={css.aspectWrapper}
//           >
//             <ResponsiveImage
//               rootClassName={css.rootForImage}
//               alt={listingTitle}
//               image={firstImage}
//               variants={variants}
//             />
//           </AspectRatioWrapper>
//           <div className={classNames(css.avatarWrapper, css.avatarMobile)}>
//             <AvatarMedium user={currentAuthor} disableProfileLink />
//           </div>
//           <div className={css.bookListingContainer}>
//             <div className={css.headingContainer}>
//               <H3 as="h1" className={css.heading}>
//                 {title}
//               </H3>
//               <H4 as="h2" className={css.detailsHeadingMobile}>
//                 <FormattedMessage id="CheckoutPage.listingTitle" values={{ listingTitle }} />
//               </H4>
//             </div>

//             <div className={css.priceBreakdownContainer}>
//               {speculateTransactionErrorMessage}
//               {breakdown}
//             </div>

//             <section className={css.paymentContainer}>
//               {initiateOrderErrorMessage}
//               {listingNotFoundErrorMessage}
//               {speculateErrorMessage}
//               {retrievePaymentIntentError ? (
//                 <p className={css.orderError}>
//                   <FormattedMessage
//                     id="CheckoutPage.retrievingStripePaymentIntentFailed"
//                     values={{ listingLink }}
//                   />
//                 </p>
//               ) : null}
//               {showPaymentForm ? (
//                 <StripePaymentForm
//                   className={css.paymentForm}
//                   onSubmit={values => this.handleSubmit(values, process)}
//                   inProgress={this.state.submitting}
//                   formId="CheckoutPagePaymentForm"
//                   authorDisplayName={currentAuthor.attributes.profile.displayName}
//                   showInitialMessageInput={showInitialMessageInput}
//                   initialValues={initalValuesForStripePayment}
//                   initiateOrderError={initiateOrderError}
//                   confirmCardPaymentError={confirmCardPaymentError}
//                   confirmPaymentError={confirmPaymentError}
//                   hasHandledCardPayment={hasPaymentIntentUserActionsDone}
//                   loadingData={!stripeCustomerFetched}
//                   defaultPaymentMethod={
//                     hasDefaultPaymentMethod ? currentUser.stripeCustomer.defaultPaymentMethod : null
//                   }
//                   paymentIntent={paymentIntent}
//                   onStripeInitialized={stripe => this.onStripeInitialized(stripe, process)}
//                   askShippingDetails={askShippingDetails}
//                   showPickUplocation={orderData?.deliveryMethod === 'pickup'}
//                   listingLocation={currentListing?.attributes?.publicData?.location}
//                   totalPrice={tx.id ? getFormattedTotalPrice(tx, intl) : null}
//                   locale={config.localization.locale}
//                   stripePublishableKey={config.stripe.publishableKey}
//                   marketplaceName={config.marketplaceName}
//                   isBooking={isBookingProcessAlias(transactionProcessAlias)}
//                   isFuzzyLocation={config.maps.fuzzy.enabled}
//                 />
//               ) : null}
//               {isPaymentExpired ? (
//                 <p className={css.orderError}>
//                   <FormattedMessage
//                     id="CheckoutPage.paymentExpiredMessage"
//                     values={{ listingLink }}
//                   />
//                 </p>
//               ) : null}
//             </section>
//           </div>

//           <div className={css.detailsContainerDesktop}>
//             <AspectRatioWrapper
//               width={aspectWidth}
//               height={aspectHeight}
//               className={css.detailsAspectWrapper}
//             >
//               <ResponsiveImage
//                 rootClassName={css.rootForImage}
//                 alt={listingTitle}
//                 image={firstImage}
//                 variants={variants}
//               />
//             </AspectRatioWrapper>
//             <div className={css.listingDetailsWrapper}>
//               <div className={css.avatarWrapper}>
//                 <AvatarMedium user={currentAuthor} disableProfileLink />
//               </div>
//               <div className={css.detailsHeadings}>
//                 <H4 as="h2">
//                   <NamedLink
//                     name="ListingPage"
//                     params={{ id: currentListing.id?.uuid, slug: createSlug(listingTitle) }}
//                   >
//                     {listingTitle}
//                   </NamedLink>
//                 </H4>
//                 <p className={css.detailsSubtitle}>{detailsVariantSubTitle}</p>
//               </div>
//               {speculateTransactionErrorMessage}
//               <H6 as="h3" className={css.orderBreakdownTitle}>
//                 <FormattedMessage id={`CheckoutPage.${latestProcessName}.orderBreakdown`} />
//               </H6>
//               <hr className={css.totalDivider} />
//             </div>
//             {breakdown}
//           </div>
//         </div>
//       </Page>
//     );
//   }
// }

// CheckoutPageComponent.defaultProps = {
//   initiateOrderError: null,
//   confirmPaymentError: null,
//   listing: null,
//   orderData: {},
//   speculateTransactionError: null,
//   speculatedTransaction: null,
//   transaction: null,
//   currentUser: null,
//   paymentIntent: null,
// };

// CheckoutPageComponent.propTypes = {
//   scrollingDisabled: bool.isRequired,
//   listing: propTypes.listing,
//   orderData: object,
//   fetchStripeCustomer: func.isRequired,
//   stripeCustomerFetched: bool.isRequired,
//   fetchSpeculatedTransaction: func.isRequired,
//   speculateTransactionInProgress: bool.isRequired,
//   speculateTransactionError: propTypes.error,
//   speculatedTransaction: propTypes.transaction,
//   transaction: propTypes.transaction,
//   currentUser: propTypes.currentUser,
//   params: shape({
//     id: string,
//     slug: string,
//   }).isRequired,
//   onConfirmPayment: func.isRequired,
//   onInitiateOrder: func.isRequired,
//   onConfirmCardPayment: func.isRequired,
//   onRetrievePaymentIntent: func.isRequired,
//   onSavePaymentMethod: func.isRequired,
//   onSendMessage: func.isRequired,
//   initiateOrderError: propTypes.error,
//   confirmPaymentError: propTypes.error,
//   // confirmCardPaymentError comes from Stripe so that's why we can't expect it to be in a specific form
//   confirmCardPaymentError: oneOfType([propTypes.error, object]),
//   paymentIntent: object,

//   // from connect
//   dispatch: func.isRequired,

//   // from useIntl
//   intl: intlShape.isRequired,

//   // from useConfiguration
//   config: object.isRequired,

//   // from useRouteConfiguration
//   routeConfiguration: arrayOf(propTypes.route).isRequired,

//   // from useHistory
//   history: shape({
//     push: func.isRequired,
//   }).isRequired,
// };

// const EnhancedCheckoutPage = props => {
//   const config = useConfiguration();
//   const routeConfiguration = useRouteConfiguration();
//   const intl = useIntl();
//   const history = useHistory();

//   return (
//     <CheckoutPageComponent
// =======
  return processName && isInquiryProcess ? (
    <CheckoutPageWithInquiryProcess
      config={config}
      routeConfiguration={routeConfiguration}
      intl={intl}
      history={history}
      processName={processName}
      pageData={pageData}
      listingTitle={listingTitle}
      title={title}
      onInquiryWithoutPayment={onInquiryWithoutPayment}
      onSubmitCallback={onSubmitCallback}
      {...props}
    />
  ) : processName && !isInquiryProcess && !speculateTransactionInProgress ? (
    <CheckoutPageWithPayment
      config={config}
      routeConfiguration={routeConfiguration}
      intl={intl}
      history={history}
      processName={processName}
      sessionStorageKey={STORAGE_KEY}
      pageData={pageData}
      setPageData={setPageData}
      listingTitle={listingTitle}
      title={title}
      onSubmitCallback={onSubmitCallback}
      {...props}
    />
  ) : (
    <Page title={title} scrollingDisabled={scrollingDisabled}>
      <CustomTopbar intl={intl} />
    </Page>
  );
};

const mapStateToProps = state => {
  const {
    listing,
    orderData,
    stripeCustomerFetched,
    speculateTransactionInProgress,
    speculateTransactionError,
    speculatedTransaction,
    transaction,
    initiateInquiryError,
    initiateOrderError,
    confirmPaymentError,
    comissionValue
  } = state.CheckoutPage;

  const { currentUser } = state.user;
  const { confirmCardPaymentError, paymentIntent, retrievePaymentIntentError } = state.stripe;
  return {
    scrollingDisabled: isScrollingDisabled(state),
    currentUser,
    stripeCustomerFetched,
    orderData,
    speculateTransactionInProgress,
    speculateTransactionError,
    speculatedTransaction,
    transaction,
    listing,
    initiateInquiryError,
    initiateOrderError,
    confirmCardPaymentError,
    confirmPaymentError,
    paymentIntent,
    retrievePaymentIntentError,
    comissionValue
  };
};

const mapDispatchToProps = dispatch => ({
  dispatch,
  fetchSpeculatedTransaction: (params, processAlias, txId, transitionName, isPrivileged, commission) =>
    dispatch(speculateTransaction(params, processAlias, txId, transitionName, isPrivileged, commission)),
  fetchStripeCustomer: () => dispatch(stripeCustomer()),
  fetchCommission: (listing) => dispatch(getCommission(listing)),
  onInquiryWithoutPayment: (params, processAlias, transitionName) =>
    dispatch(initiateInquiryWithoutPayment(params, processAlias, transitionName)),
  onInitiateOrder: (params, processAlias, transactionId, transitionName, isPrivileged) =>
    dispatch(initiateOrder(params, processAlias, transactionId, transitionName, isPrivileged)),
  onRetrievePaymentIntent: params => dispatch(retrievePaymentIntent(params)),
  onConfirmCardPayment: params => dispatch(confirmCardPayment(params)),
  onConfirmPayment: (transactionId, transitionName, transitionParams) =>
    dispatch(confirmPayment(transactionId, transitionName, transitionParams)),
  onSendMessage: params => dispatch(sendMessage(params)),
  onSavePaymentMethod: (stripeCustomer, stripePaymentMethodId) =>
    dispatch(savePaymentMethod(stripeCustomer, stripePaymentMethodId)),
});

const CheckoutPage = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(EnhancedCheckoutPage);

CheckoutPage.setInitialValues = (initialValues, saveToSessionStorage = false) => {
  if (saveToSessionStorage) {
    const { listing, orderData } = initialValues;
    storeData(orderData, listing, null, STORAGE_KEY);
  }

  return setInitialValues(initialValues);
};

CheckoutPage.displayName = 'CheckoutPage';

export default CheckoutPage;
