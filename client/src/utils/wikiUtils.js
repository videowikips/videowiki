import config from './config';

export const getLanguageFromWikisource = function(wikiSource) {
  const re = /^https:\/\/(.+)\.(.+)\.(.+)$/;

  const match = wikiSource.match(re);
  console.log(match)
  if (match && match.length > 1 && config.AVAILABLE_LANGUAGES.indexOf(match[1]) !== -1) {
    return match[1];
  }
  // Default to english
  return 'en';
}
