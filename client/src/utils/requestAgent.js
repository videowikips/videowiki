import { store } from '../store';
const request = require('superagent-use')(require('superagent'));

const ENVIRONMENT = process.env.NODE_ENV;
const PROTOCOL = window.location.protocol;
const LANG_API_MAP = {
  'en': `${PROTOCOL}//localhost:4000`,
  'hi': `${PROTOCOL}//localhost:4001`,
  'es': `${PROTOCOL}//localhost:4002`,
  'fr': `${PROTOCOL}//localhost:4003`,
}

request.use((req) => {
  const state = store.getState();
  const lang = state.ui.language;
  console.log(req.url)
  const token = state.auth.token;
  if (token) {
    req.header['x-access-token'] = token;
  }
  if (req.url.indexOf('/api') === 0) {
    if (ENVIRONMENT === 'production') {
      req.url = req.url.replace('/api/', `/${lang}/api/`);
    } else {
      req.url = `${LANG_API_MAP[lang]}${req.url}`
    }
    console.log('================ http request ', req.url);
  }
  return req;
});

export default request;
