const jwt = require('jsonwebtoken');
import uuidV4 from 'uuid/v4';
import { User } from '../shared/models';

const MONTH_TIME = 60 * 60 * 24 * 30;

const usersController = {
  validateSession(req, res) {
    // Refresh the token
    if (req.user && req.user.mediawikiId) {
      User.findOne({ mediawikiId: req.user.mediawikiId }, (err, user) => {
        if (err || !user || !user.mediawikiId) {
          console.log('jwt error fetching user data token request ', err);
          return res.send(401, 'Unauthorized!')
        }
        jwt.sign(user.toObject(), process.env.APP_SECRET, { expiresIn: MONTH_TIME }, (err, token) => {
          if (err) {
            console.log('jwt error while refreshing token request ', err);
            return res.send(401, 'Unauthorized!')
          }
          return res.json({ user, token });
        })
      })
    } else {
      const anonymId = req.headers['x-vw-anonymous-id'] || uuidV4();
      return res.json({ anonymousId: anonymId })
    }
  },

  logOut(req, res) {
    req.logout()
    req.logOut()
    req.session.destroy(() => {
      req.session = null
      res.send('Logout successfull!')
    })
  },

}
export default usersController;
