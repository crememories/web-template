const { serialize } = require('../api-util/sdk');

exports.actionTapfiliate = (req, res) => {
  const query = req.body;

  fetch('https://api.tapfiliate.com/1.6/clicks/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Api-Key': '62889eeac02707ad34511538138150493597419d'
    },
    body: JSON.stringify({
      referral_code: 'mjdinzm',
    })
  })
  .then(json => {
    console.log('json - fetch - suc');
    console.log(json);
  })
  .catch(error => {
    console.log('error - fetch');
    console.error(error);
  });

  return res.status(200)
  .set('Content-Type', 'application/transit+json')
  .send(serialize({ data: query }))
  .end();
  
  // res.cookie(stateKey, state, cookieOpts);
  // res.cookie(codeVerifierKey, codeVerifier, cookieOpts);

};

exports.purchaseTapfiliate = (req, res) => {
  const query = req.body;

  console.log(req)


  // res.cookie(stateKey, state, cookieOpts);
  // res.cookie(codeVerifierKey, codeVerifier, cookieOpts);
  return res.status(200)
  .set('Content-Type', 'application/transit+json')
  .send(serialize({ data: query }))
  .end();
};
