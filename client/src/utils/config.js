const PROTOCOL = window.location.protocol;

module.exports = {
  LANG_API_MAP: {
    'en': `${PROTOCOL}//localhost:4000`,
    'hi': `${PROTOCOL}//localhost:4001`,
    'es': `${PROTOCOL}//localhost:4002`,
    'ar': `${PROTOCOL}//localhost:4003`,
    'ja': `${PROTOCOL}//localhost:4004`,
    'uk': `${PROTOCOL}//localhost:4005`,
    'fr': `${PROTOCOL}//localhost:4006`,
  },
  AVAILABLE_LANGUAGES: ['en', 'hi', 'es', 'ar', 'ja', 'uk', 'fr'],
  websocketConfig: {
    url: (routeLanguage) => process.env.NODE_ENV === 'production' ? `${window.location.protocol}//${window.location.hostname}` : module.exports.LANG_API_MAP[routeLanguage],
    options: (routeLanguage) => ({
      path: process.env.NODE_ENV === 'production' ? `/${routeLanguage}/socket.io` : '/socket.io',
      secure: process.env.NODE_ENV === 'production',
    }),
  },
}
