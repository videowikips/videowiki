const PROTOCOL = window.location.protocol;

module.exports = {
  LANG_API_MAP: {
    'en': `${PROTOCOL}//localhost:4000`,
    'hi': `${PROTOCOL}//localhost:4001`,
    'es': `${PROTOCOL}//localhost:4002`,
    'fr': `${PROTOCOL}//localhost:4003`,
  },
  AVAILABLE_LANGUAGES: ['en', 'hi', 'es', 'fr'],
  websocketConfig: {
    url: (routeLanguage) => process.env.NODE_ENV === 'production' ? `http://${window.location.hostname}` : module.exports.LANG_API_MAP[routeLanguage],
    options: (routeLanguage) => ({
      path: process.env.NODE_ENV === 'production' ? `/${routeLanguage}/socket.io` : '/socket.io',
      secure: process.env.NODE_ENV === 'production',
    }),
  },
}
