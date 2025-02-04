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

      if(variantCheck){
        const variantId = bodyParams.params.stockReservationVariant;
        const variantSelected = listing.attributes.publicData.variants[variantId];
        listing.attributes.price.amount = variantSelected.variantPrice;
      }

      const addonCheck = (bodyParams.params 
        && bodyParams.params.stockReservationAddon 
        && listing.attributes.publicData
        && listing.attributes.publicData.addons);

      if(addonCheck){
        const addonIds = bodyParams.params.stockReservationAddon;
        const addonSelected = listing.attributes.publicData.addons;

        addonIds.forEach((addonOption,addonId) => {
          const addon = addonSelected[addonId].options[addonOption.option];
          listing.attributes.price.amount += addon.price;

          console.log('listing.attributes.price.amount');
          console.log(listing.attributes.price.amount);
        });

      }

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
