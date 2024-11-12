const { transactionLineItems } = require('../api-util/lineItems');
const {
  getSdk,
  getTrustedSdk,
  handleError,
  serialize,
  fetchCommission,
} = require('../api-util/sdk');

module.exports = (req, res) => {
  const { isSpeculative, orderData, bodyParams, queryParams, commission } = req.body;

  console.log('comissionValue');
  console.log(commission);
  console.log('req.body');
  console.log(req.body);

  const sdk = getSdk(req, res);
  let lineItems = null;

  const listingPromise = () => sdk.listings.show({ id: bodyParams?.params?.listingId });

  Promise.all([listingPromise(), fetchCommission(sdk)])
    .then(([showListingResponse, fetchAssetsResponse]) => {
      const listing = showListingResponse.data.data;
      const commissionAsset = fetchAssetsResponse.data.data[0];
      const variantCheck = (bodyParams.params 
        && bodyParams.params.stockReservationVariant 
        && listing.attributes.publicData
        && listing.attributes.publicData.variants);

      console.log('listing');
      console.log(listing);
      console.log('bodyParams.params');
      console.log(bodyParams.params);
      console.log('bodyParams.params.stockReservationVariant');
      console.log(bodyParams.params.stockReservationVariant);
      console.log('listing.attributes.publicData');
      console.log(listing.attributes.publicData);
      console.log('listing.attributes.publicData.variants');
      console.log(listing.attributes.publicData.variants);

      if(variantCheck){
        const variantId = bodyParams.params.stockReservationVariant;
        const variantSelected = listing.attributes.publicData.variants[variantId];
        listing.attributes.price.amount = variantSelected.variantPrice;
      }

      console.log('variantCheck');
      console.log(variantCheck);
      console.log('listing - after');
      console.log(listing);

      const { providerCommission, customerCommission } =
        commissionAsset?.type === 'jsonAsset' ? commissionAsset.attributes.data : {};

      const newProviderComission = commission ? commission : providerCommission;

      lineItems = transactionLineItems(
        listing,
        { ...orderData, ...bodyParams.params },
        newProviderComission,
        customerCommission
      );

      return getTrustedSdk(req);
    })
    .then(trustedSdk => {
      const { params } = bodyParams;

      // Add lineItems to the body params
      const body = {
        ...bodyParams,
        params: {
          ...params,
          lineItems,
        },
      };

      if (isSpeculative) {
        return trustedSdk.transactions.initiateSpeculative(body, queryParams);
      }
      return trustedSdk.transactions.initiate(body, queryParams);
    })
    .then(apiResponse => {
      const { status, statusText, data } = apiResponse;
      res
        .status(status)
        .set('Content-Type', 'application/transit+json')
        .send(
          serialize({
            status,
            statusText,
            data,
          })
        )
        .end();
    })
    .catch(e => {
      handleError(res, e);
    });
};
