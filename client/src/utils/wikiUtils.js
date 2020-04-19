import config from './config';

export const getLanguageFromWikisource = function(wikiSource) {
  const re = /^https:\/\/(.+)\.(.+)\.(.+)$/;

  const match = wikiSource.match(re);
  if (match && match.length > 1 && config.AVAILABLE_LANGUAGES.indexOf(match[1]) !== -1) {
    return match[1];
  }
  // Default to english
  return 'en';
}

export const getWikiFileExtension = function(url) {
  const lastPart = url.split('/').pop();
  const extensions = lastPart.split('.');
  extensions.shift();
  return extensions.length > 0 ? extensions[0].trim().toLowerCase() : '';
}
