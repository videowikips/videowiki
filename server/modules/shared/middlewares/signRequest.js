const jwt = require('jsonwebtoken');

export default function signRequest(req, res, next) {
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
};
