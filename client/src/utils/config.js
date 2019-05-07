const PROTOCOL = window.location.protocol;

module.exports = {
  LANG_API_MAP: {
    'en': `${PROTOCOL}//localhost:4000`,
    'hi': `${PROTOCOL}//localhost:4001`,
    'es': `${PROTOCOL}//localhost:4002`,
    'fr': `${PROTOCOL}//localhost:4003`,
  },
  SOCKET_LANG_API_MAP: {
    'en': `${PROTOCOL}//${window.location.hostname}:4000/en`,
    'hi': `${PROTOCOL}//${window.location.hostname}:4001/hi`,
    'es': `${PROTOCOL}//${window.location.hostname}:4002/es`,
    'fr': `${PROTOCOL}//${window.location.hostname}:4003/fr`,
  },
  AVAILABLE_LANGUAGES: ['en', 'hi', 'es', 'fr'],
}
