const { serialize } = require('../api-util/sdk');
const USING_SSL = process.env.REACT_APP_SHARETRIBE_USING_SSL === 'true';
const CLIENT_ID = process.env.REACT_APP_SHARETRIBE_SDK_CLIENT_ID;

exports.actionTapfiliate = (req, res) => {
  const query = req.body;

  fetch('https://api.tapfiliate.com/1.6/clicks/', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "Api-Key": "62889eeac02707ad34511538138150493597419d"
    },
    body: JSON.stringify({
      "referral_code": query
    })
  }).then(function(response){ 
    response.json().then(data => {
      return res.status(200)
      .set('Content-Type', 'application/transit+json')
      .send(serialize({ data: data.id }))
      .end();
    })

  })
  .catch(function(response){ console.log(response) })
};

exports.purchaseTapfiliate = (req, res) => {
  const query = req.body;

  const click_id = query.tapfiliateId;
  const external_id = query.transactionId;
  const amount = query.amount/100;

  fetch('https://api.tapfiliate.com/1.6/conversions/', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "Api-Key": "62889eeac02707ad34511538138150493597419d"
    },
    body: JSON.stringify({
      "click_id": click_id,
      "external_id": external_id,
      "amount": amount,
    })
  }).then(function(response){ 
    response.json().then(data => {
      return res.status(200)
      .set('Content-Type', 'application/transit+json')
      .send(serialize({ data: data.id }))
      .end();
    })

  })
  .catch(function(response){ console.log(response) })
};
