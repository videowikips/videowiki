const PROTOCOL = window.location.protocol;

module.exports = {
  LANG_API_MAP: {
    en: `${PROTOCOL}//localhost:4000`,
    hi: `${PROTOCOL}//localhost:4001`,
    es: `${PROTOCOL}//localhost:4002`,
    ar: `${PROTOCOL}//localhost:4003`,
    ja: `${PROTOCOL}//localhost:4004`,
    uk: `${PROTOCOL}//localhost:4005`,
    fr: `${PROTOCOL}//localhost:4006`,
    or: `${PROTOCOL}//localhost:4007`,
    te: `${PROTOCOL}//localhost:4008`,
    gu: `${PROTOCOL}//localhost:4009`,
    bn: `${PROTOCOL}//localhost:4010`,
    pa: `${PROTOCOL}//localhost:4011`,
    sat: `${PROTOCOL}//localhost:4012`,
    sv: `${PROTOCOL}//localhost:4013`,
    it: `${PROTOCOL}//localhost:4014`,
    kn: `${PROTOCOL}//localhost:4015`,
    ml: `${PROTOCOL}//localhost:4016`,
    ta: `${PROTOCOL}//localhost:4017`,
  },
  AVAILABLE_LANGUAGES: [
    'en',
    'hi',
    'es',
    'ar',
    'ja',
    'uk',
    'fr',
    'or',
    'te',
    'gu',
    'bn',
    'pa',
    'sat',
    'sv',
    'it',
    'kn',
    'ml',
    'ta',
  ],
  SUPPORTED_TTS_LANGS: [
    'en',
    'hi',
    'es',
    'ar',
    'ja',
    'uk',
    'fr',
    // 'or',
    'te',
    'gu',
    'bn',
    // 'pa',
    // 'sat',
    'sv',
    'it',
    'kn',
    'ml',
    'ta',
  ],
  websocketConfig: {
    url: (routeLanguage) =>
      process.env.NODE_ENV === 'production'
        ? `${window.location.protocol}//${window.location.hostname}`
        : module.exports.LANG_API_MAP[routeLanguage],
    options: (routeLanguage) => ({
      path:
        process.env.NODE_ENV === 'production'
          ? `/${routeLanguage}/socket.io`
          : '/socket.io',
      secure: process.env.NODE_ENV === 'production',
    }),
  },
};
