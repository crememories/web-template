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
      "referral_code": "mjdinzm"
    })
  }).then(function(response){ 
    response.json().then(data => {
      console.log(data);
      const stateKey = `st-${CLIENT_ID}-tapfiliate-click`;
      let options = {
        maxAge: 1000 * 60 * 15, // would expire after 15 minutes
        httpOnly: true, // The cookie only accessible by the web server
        signed: true, // Indicates if the cookie should be signed
        secure: USING_SSL,
      }
      res.cookie(stateKey, data.id, options);
      return res.status(200)
      .set('Content-Type', 'application/transit+json')
      .send(serialize({ data: data.id }))
      .end();
    })

  })
  .catch(function(response){ console.log(response) })

  // axios.post('https://api.tapfiliate.com/1.6/clicks/', 
  //   JSON.stringify({
  //   "referral_code": "mjdinzm"
  //   }), 
  //   {
  //     headers: {
  //       "Content-Type": "application/json",
  //       "Api-Key": "62889eeac02707ad34511538138150493597419d"
  //     }
  //   })
  // .then(function (response) {
  //   console.log(response);
  // })
  // .catch(function (error) {
  //   console.log(error);
  // });


  
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
