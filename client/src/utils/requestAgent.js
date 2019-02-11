import { store } from '../store';
import { LANG_API_MAP } from './config'
const request = require('superagent-use')(require('superagent'));

const ENVIRONMENT = process.env.NODE_ENV;

request.use((req) => {
  const state = store.getState();
  const lang = state.ui.language;
  const token = state.auth.token;
  const anonymousId = state.auth.session && state.auth.session.anonymousId ? state.auth.session.anonymousId : '';

  if (token) {
    req.header['x-access-token'] = token;
  }
  if (anonymousId) {
    req.header['x-vw-anonymous-id'] = anonymousId;
  }
  if (req.url.indexOf('/api') === 0) {
    if (ENVIRONMENT === 'production') {
      req.url = req.url.replace('/api/', `/${lang}/api/`);
    } else {
      req.url = `${LANG_API_MAP[lang]}${req.url}`
    }
  }
  return req;
});

export default request;
