import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import pick from 'lodash/pick';
import { initiatePrivileged, transitionPrivileged, getListingOwnerAdmin } from '../../util/api';
import { denormalisedResponseEntities } from '../../util/data';
import { storableError } from '../../util/errors';
import * as log from '../../util/log';
import { setCurrentUserHasOrders, fetchCurrentUser } from '../../ducks/user.duck';
import Cookies from 'universal-cookie';

// ================ Async thunks ================ //

////////////////////
// Initiate Order //
////////////////////
const initiateOrderPayloadCreator = (
  { orderParams, processAlias, transactionId, transitionName, isPrivilegedTransition, commission },
  { dispatch, extra: sdk, rejectWithValue }
) => {
  // If we already have a transaction ID, we should transition, not initiate.
  const isTransition = !!transactionId;

  const { deliveryMethod, quantity, variant, bookingDates, addonVariant, ...otherOrderParams } = orderParams;
  const cookies = new Cookies(); 

  //set cookie for tapfiliate transaction conversion
  cookies.set('tapfiliateOrder', orderParams?.listingId?.uuid, { path: '/' });
  const quantityMaybe = quantity ? { stockReservationQuantity: quantity } : {};
  const variantMaybe = quantity ? { stockReservationVariant: variant } : {};
  const addonMaybe = quantity ? { stockReservationAddon: addonVariant } : {};
  const bookingParamsMaybe = bookingDates || {};

  // Parameters only for client app's server
  const orderData = deliveryMethod ? { deliveryMethod } : {};

  // Parameters for Marketplace API
  const transitionParams = {
    ...quantityMaybe,
    ...bookingParamsMaybe,
    ...variantMaybe,
    ...addonMaybe,
    ...otherOrderParams,
  };

  const bodyParams = isTransition
    ? {
        id: transactionId,
        transition: transitionName,
        params: transitionParams,
      }
    : {
        processAlias,
        transition: transitionName,
        params: transitionParams,
      };
  const queryParams = {
    include: ['booking', 'provider'],
    expand: true,
  };

  const handleSuccess = response => {
    const entities = denormalisedResponseEntities(response);
    const order = entities[0];
    dispatch(setCurrentUserHasOrders());
    return order;
  };

  const handleError = e => {
    const transactionIdMaybe = transactionId ? { transactionId: transactionId.uuid } : {};
    log.error(e, 'initiate-order-failed', {
      ...transactionIdMaybe,
      listingId: orderParams.listingId.uuid,
      ...quantityMaybe,
      ...bookingParamsMaybe,
      ...orderData,
      statusText: e.statusText,
    });
    return rejectWithValue(storableError(e));
  };

  if (isTransition && isPrivilegedTransition) {
    // transition privileged
    return transitionPrivileged({ isSpeculative: false, orderData, bodyParams, queryParams, commission })
      .then(handleSuccess)
      .catch(handleError);
  } else if (isTransition) {
    // transition non-privileged
    return sdk.transactions
      .transition(bodyParams, queryParams)
      .then(handleSuccess)
      .catch(handleError);
  } else if (isPrivilegedTransition) {
    // initiate privileged
    return initiatePrivileged({ isSpeculative: false, orderData, bodyParams, queryParams, commission })
      .then(handleSuccess)
      .catch(handleError);
  } else {
    // initiate non-privileged
    return sdk.transactions
      .initiate(bodyParams, queryParams)
      .then(handleSuccess)
      .catch(handleError);
  }
};

export const initiateOrderThunk = createAsyncThunk(
  'CheckoutPage/initiateOrder',
  initiateOrderPayloadCreator
);
// Backward compatible wrapper function for initiateOrder
export const initiateOrder = (
  orderParams,
  processAlias,
  transactionId,
  transitionName,
  isPrivilegedTransition,
  commission
) => dispatch => {
  return dispatch(
    initiateOrderThunk({
      orderParams,
      processAlias,
      transactionId,
      transitionName,
      isPrivilegedTransition,
      commission,
    })
  ).unwrap();
};

/////////////////////
// Confirm Payment //
/////////////////////
const confirmPaymentPayloadCreator = (
  { transactionId, transitionName, transitionParams = {} },
  { extra: sdk, rejectWithValue }
) => {
  const bodyParams = {
    id: transactionId,
    transition: transitionName,
    params: transitionParams,
  };
  const queryParams = {
    include: ['booking', 'provider'],
    expand: true,
  };

  return sdk.transactions
    .transition(bodyParams, queryParams)
    .then(response => {
      const order = response.data.data;
      return order;
    })
    .catch(e => {
      const transactionIdMaybe = transactionId ? { transactionId: transactionId.uuid } : {};
      log.error(e, 'initiate-order-failed', {
        ...transactionIdMaybe,
      });
      return rejectWithValue(storableError(e));
    });
};

export const confirmPaymentThunk = createAsyncThunk(
  'CheckoutPage/confirmPayment',
  confirmPaymentPayloadCreator
);
// Backward compatible wrapper function for confirmPayment
export const confirmPayment = (
  transactionId,
  transitionName,
  transitionParams = {}
) => dispatch => {
  return dispatch(
    confirmPaymentThunk({
      transactionId,
      transitionName,
      transitionParams,
    })
  ).unwrap();
};

//////////////////
// Send Message //
//////////////////
const sendMessagePayloadCreator = ({ message, id: orderId }, { extra: sdk, rejectWithValue }) => {
  if (message) {
    return sdk.messages
      .send({ transactionId: orderId, content: message })
      .then(() => {
        return { orderId, messageSuccess: true };
      })
      .catch(e => {
        log.error(e, 'initial-message-send-failed', { txId: orderId });
        return rejectWithValue({ orderId, messageSuccess: false });
      });
  } else {
    return { orderId, messageSuccess: true };
  }
};

export const sendMessageThunk = createAsyncThunk(
  'CheckoutPage/sendMessage',
  sendMessagePayloadCreator
);
// Backward compatible wrapper function for sendMessage
export const sendMessage = params => dispatch => {
  return dispatch(sendMessageThunk(params)).unwrap();
};

//////////////////////
// Initiate Inquiry //
//////////////////////

const initiateInquiryPayloadCreator = (
  { inquiryParams, processAlias, transitionName },
  { extra: sdk, rejectWithValue }
) => {
  if (!processAlias) {
    const error = new Error('No transaction process attached to listing');
    log.error(error, 'listing-process-missing', {
      listingId: inquiryParams?.listingId?.uuid,
    });
    return rejectWithValue(storableError(error));
  }

  const bodyParams = {
    transition: transitionName,
    processAlias,
    params: inquiryParams,
  };
  const queryParams = {
    include: ['provider'],
    expand: true,
  };

  return sdk.transactions
    .initiate(bodyParams, queryParams)
    .then(response => {
      const transactionId = response.data.data.id;
      return transactionId;
    })
    .catch(e => {
      dispatch(initiateInquiryError(storableError(e)));
      throw e;
    });
};

export const initiateInquiryThunk = createAsyncThunk(
  'CheckoutPage/initiateInquiry',
  initiateInquiryPayloadCreator
);

//////////////////////
// Initiate Commission
//////////////////////

const commissionCreator = async (
  { listingId },
  { rejectWithValue }
) => {
  try {
    const response = await getListingOwnerAdmin(listingId);

    const commission =
      response?.attributes?.profile?.metadata?.commission;

      // console.log(commission);
      // console.log('commission');

    // only return when commission exists
    if (commission !== undefined) {
      return commission;
    }

    // Do nothing if commission does not exist
    return undefined;

  } catch (e) {
    log.error(e, 'get-commission-failed', { listingId });
    return rejectWithValue(storableError(e));
  }
};

// getCommission is a commission for listing creator
export const commissionThunk = createAsyncThunk(
  'CheckoutPage/getCommission',
  commissionCreator
);


export const getCommission = (
  listingId,
  processAlias,
  transitionName
) => dispatch => {
  console.log('initiate get commission');
  return dispatch(
    commissionThunk({
      listingId,
      processAlias,
      transitionName,
    })
  ).unwrap();
};

// Backward compatible wrapper function for initiateInquiryWithoutPayment
/**
 * Initiate transaction against default-inquiry process
 * Note: At this point inquiry transition is made directly against Marketplace API.
 *       So, client app's server is not involved here unlike with transitions including payments.
 *
 * @param {Object} params
 * @param {Object} params.inquiryParams contains listingId and protectedData
 * @param {String} params.processAlias 'default-inquiry/release-1'
 * @param {String} params.transitionName 'transition/inquire-without-payment'
 * @returns
 */
export const initiateInquiryWithoutPayment = (
  inquiryParams,
  processAlias,
  transitionName
) => dispatch => {
  return dispatch(
    initiateInquiryThunk({
      inquiryParams,
      processAlias,
      transitionName,
    })
  ).unwrap();
};

///////////////////////////
// Speculate Transaction //
///////////////////////////
/**
 * Initiate or transition the speculative transaction with the given
 * booking details
 *
 * The API allows us to do speculative transaction initiation and
 * transitions. This way we can create a test transaction and get the
 * actual pricing information as if the transaction had been started,
 * without affecting the actual data.
 *
 * We store this speculative transaction in the page store and use the
 * pricing info for the booking breakdown to get a proper estimate for
 * the price with the chosen information.
 */

const speculateTransactionPayloadCreator = (
  { orderParams, processAlias, transactionId, transitionName, isPrivilegedTransition,
  commission },
  { dispatch, extra: sdk, rejectWithValue }
) => {
  // If we already have a transaction ID, we should transition, not initiate.
  const isTransition = !!transactionId;

  console.log('commission- commission');
  console.log(commission);  

  const {
    deliveryMethod,
    priceVariantName,
    quantity,
    variant,
    bookingDates,
    ...otherOrderParams
  } = orderParams;
  const quantityMaybe = quantity ? { stockReservationQuantity: quantity } : {};
  const variantMaybe = quantity ? { stockReservationVariant: variant } : {};
  const bookingParamsMaybe = bookingDates || {};

  // Parameters only for client app's server
  const orderData = {
    ...(deliveryMethod ? { deliveryMethod } : {}),
    ...(priceVariantName ? { priceVariantName } : {}),
  };

  // Parameters for Marketplace API
  const transitionParams = {
    ...quantityMaybe,
    ...bookingParamsMaybe,
    ...variantMaybe,
    ...otherOrderParams,
    cardToken: 'CheckoutPage_speculative_card_token',
  };

  const bodyParams = isTransition
    ? {
        id: transactionId,
        transition: transitionName,
        params: transitionParams,
      }
    : {
        processAlias,
        transition: transitionName,
        params: transitionParams,
      };

  const queryParams = {
    include: ['booking', 'provider'],
    expand: true,
  };

  const handleSuccess = response => {
    const entities = denormalisedResponseEntities(response);
    if (entities.length !== 1) {
      throw new Error('Expected a resource in the speculate response');
    }
    const tx = entities[0];
    return tx;
  };

  const handleError = e => {
    log.error(e, 'speculate-transaction-failed', {
      listingId: transitionParams.listingId.uuid,
      ...quantityMaybe,
      ...bookingParamsMaybe,
      ...orderData,
      statusText: e.statusText,
    });
    return rejectWithValue(storableError(e));
  };

  if (isTransition && isPrivilegedTransition) {
    // transition privileged
    return transitionPrivileged({ isSpeculative: true, orderData, bodyParams, queryParams, commission })
      .then(handleSuccess)
      .catch(handleError);
  } else if (isTransition) {
    // transition non-privileged
    return sdk.transactions
      .transitionSpeculative(bodyParams, queryParams)
      .then(handleSuccess)
      .catch(handleError);
  } else if (isPrivilegedTransition) {
    // initiate privileged
    return initiatePrivileged({ isSpeculative: true, orderData, bodyParams, queryParams, commission })
      .then(handleSuccess)
      .catch(handleError);
  } else {
    // initiate non-privileged
    return sdk.transactions
      .initiateSpeculative(bodyParams, queryParams)
      .then(handleSuccess)
      .catch(handleError);
  }
};

export const speculateTransactionThunk = createAsyncThunk(
  'CheckoutPage/speculateTransaction',
  speculateTransactionPayloadCreator
);
// Backward compatible wrapper function for speculateTransaction
export const speculateTransaction = (
  orderParams,
  processAlias,
  transactionId,
  transitionName,
  isPrivilegedTransition,
  commission
) => dispatch => {
  return dispatch(
    speculateTransactionThunk({
      orderParams,
      processAlias,
      transactionId,
      transitionName,
      isPrivilegedTransition,
      commission,
    })
  ).unwrap();
};

///////////////////////////
// Fetch Stripe Customer //
///////////////////////////
const stripeCustomerPayloadCreator = ({}, { dispatch, rejectWithValue }) => {
  const fetchCurrentUserOptions = {
    callParams: { include: ['stripeCustomer.defaultPaymentMethod'] },
    updateHasListings: false,
    updateNotifications: false,
    enforce: true,
  };

  return dispatch(fetchCurrentUser(fetchCurrentUserOptions))
    .then(response => {
      return response;
    })
    .catch(e => {
      return rejectWithValue(storableError(e));
    });
};

export const stripeCustomerThunk = createAsyncThunk(
  'CheckoutPage/stripeCustomer',
  stripeCustomerPayloadCreator
);
// Backward compatible wrapper function for stripeCustomer
export const stripeCustomer = () => dispatch => {
  return dispatch(stripeCustomerThunk({})).unwrap();
};

// ================ Slice ================ //

const initialState = {
  listing: null,
  orderData: null,
  speculateTransactionInProgress: false,
  speculateTransactionError: null,
  speculatedTransaction: null,
  isClockInSync: false,
  transaction: null,
  initiateOrderError: null,
  confirmPaymentError: null,
  stripeCustomerFetched: false,
  initiateInquiryInProgress: false,
  initiateInquiryError: null,
  commissionInProgress: false,
  commissionError: null,
  commission: null,
};

const checkoutPageSlice = createSlice({
  name: 'CheckoutPage',
  initialState,
  reducers: {
    setInitialValues: (state, action) => {
      return { ...initialState, ...pick(action.payload, Object.keys(initialState)) };
    },
  },
  extraReducers: builder => {
    builder
      // Initiate Order cases
      .addCase(initiateOrderThunk.pending, state => {
        state.initiateOrderError = null;
      })
      .addCase(initiateOrderThunk.fulfilled, (state, action) => {
        state.transaction = action.payload;
      })
      .addCase(initiateOrderThunk.rejected, (state, action) => {
        console.error(action.payload); // eslint-disable-line no-console
        state.initiateOrderError = action.payload;
      })
      // Confirm Payment cases
      .addCase(confirmPaymentThunk.pending, state => {
        state.confirmPaymentError = null;
      })
      .addCase(confirmPaymentThunk.fulfilled, state => {
        // Payment confirmed successfully, no state change needed
      })
      .addCase(confirmPaymentThunk.rejected, (state, action) => {
        console.error(action.payload); // eslint-disable-line no-console
        state.confirmPaymentError = action.payload;
      })
      // Speculate Transaction cases
      .addCase(speculateTransactionThunk.pending, state => {
        state.speculateTransactionInProgress = true;
        state.speculateTransactionError = null;
        state.speculatedTransaction = null;
      })
      .addCase(speculateTransactionThunk.fulfilled, (state, action) => {
        // Check that the local devices clock is within a minute from the server
        const lastTransitionedAt = action.payload?.attributes?.lastTransitionedAt;
        const localTime = new Date();
        const minute = 60000;
        state.speculateTransactionInProgress = false;
        state.speculatedTransaction = action.payload;
        state.isClockInSync =
          Math.abs(lastTransitionedAt?.getTime() - localTime.getTime()) < minute;
      })
      .addCase(speculateTransactionThunk.rejected, (state, action) => {
        console.error(action.payload); // eslint-disable-line no-console
        state.speculateTransactionInProgress = false;
        state.speculateTransactionError = action.payload;
      })
      // Stripe Customer cases
      .addCase(stripeCustomerThunk.pending, state => {
        state.stripeCustomerFetched = false;
      })
      .addCase(stripeCustomerThunk.fulfilled, state => {
        state.stripeCustomerFetched = true;
      })
      .addCase(stripeCustomerThunk.rejected, (state, action) => {
        console.error(action.payload); // eslint-disable-line no-console
        state.stripeCustomerFetchError = action.payload;
      })
      // Initiate Inquiry cases
      .addCase(initiateInquiryThunk.pending, state => {
        state.initiateInquiryInProgress = true;
        state.initiateInquiryError = null;
      })
      .addCase(initiateInquiryThunk.fulfilled, state => {
        state.initiateInquiryInProgress = false;
      })
      .addCase(initiateInquiryThunk.rejected, (state, action) => {
        state.initiateInquiryInProgress = false;
        state.initiateInquiryError = action.payload;
      })
      // Commission cases
      .addCase(commissionThunk.pending, state => {
        state.commissionInProgress = true;
        state.commissionError = null;
      })
      .addCase(commissionThunk.fulfilled, (state, action) => {
        state.commissionInProgress = false;
        // Match old thunk behavior
        if (action.payload !== undefined) {
          console.log('action.payload');
          console.log(action.payload);
          state.commission = action.payload;
        }
      })
      .addCase(commissionThunk.rejected, (state, action) => {
        state.commissionInProgress = false;
        state.commissionError = action.payload;
      });
  },
});

// Export the action creators
export const { setInitialValues } = checkoutPageSlice.actions;

// Export the reducer
export default checkoutPageSlice.reducer;
