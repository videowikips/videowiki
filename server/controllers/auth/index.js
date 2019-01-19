const jwt = require('jsonwebtoken');

function isAuthenticated(req, res, next) {
  // if user is authenticated in the session, call the next() to call the next request handler
  // Passport adds this method to request object. A middleware is allowed to add properties to
  // request and response objects
  if (req.user) {
    return next()
  }
  // if the user is not authenticated then redirect him to the login page
  res.send(401, 'Unauthorized!')
}

function signRequest(req, res, next) {
  // console.log(req.session, 'users session ', req.user, 'user obj')
  const token = req.headers['x-access-token'];
  if (!token) {
    return next();
  }
  jwt.verify(token, process.env.APP_SECRET, (err, user) => {
    if (err) {
      console.log('decodeApiToken - error ', err);
    } else {
      req.user = user;
    }
    next();
  });
}

module.exports = {
  isAuthenticated,
  signRequest,
}
