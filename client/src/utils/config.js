const PROTOCOL = window.location.protocol;

module.exports = {
  LANG_API_MAP: {
    'en': `${PROTOCOL}//localhost:4000`,
    'hi': `${PROTOCOL}//localhost:4001`,
    'es': `${PROTOCOL}//localhost:4002`,
    'fr': `${PROTOCOL}//localhost:4003`,
  },
  SOCKET_LANG_API_MAP: {
    'en': `${PROTOCOL}//${window.location.hostname}/en`,
    'hi': `${PROTOCOL}//${window.location.hostname}/hi`,
    'es': `${PROTOCOL}//${window.location.hostname}/es`,
    'fr': `${PROTOCOL}//${window.location.hostname}/fr`,
  },
  AVAILABLE_LANGUAGES: ['en', 'hi', 'es', 'fr'],
}
