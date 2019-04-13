import { httpGet } from './Common'

function searchWiki ({ searchText, wikiSource }) {
  let url = `/api/wiki/search?searchTerm=${encodeURIComponent(searchText)}`

  if (wikiSource) {
    url += `&wikiSource=${wikiSource}`;
  }

  return httpGet(url).then(
    ({ body }) => ({
      searchResults: body.searchResults,
    }),
  )
}

function fetchImagesFromWikimediaCommons ({ searchText }) {
  const url = `/api/wiki/wikimediaCommons/images?searchTerm=${searchText}`

  return httpGet(url).then(
    ({ body }) => ({
      images: body.images,
    }),
  ).catch((reason) => { throw { error: 'FAILED', reason } })
}

function fetchGifsFromWikimediaCommons ({ searchText }) {
  const url = `/api/wiki/wikimediaCommons/gifs?searchTerm=${searchText}`

  return httpGet(url).then(
    ({ body }) => ({
      gifs: body.gifs,
    }),
  ).catch((reason) => { throw { error: 'FAILED', reason } })
}

function fetchVideosFromWikimediaCommons ({ searchText }) {
  const url = `/api/wiki/wikimediaCommons/videos?searchTerm=${searchText}`

  return httpGet(url).then(
    ({ body }) => ({
      videos: body.videos,
    }),
  ).catch((reason) => { throw { error: 'FAILED', reason } })
}

function fetchCategoriesFromWikimediaCommons ({ searchText }) {
  const url = `/api/wiki/wikimediaCommons/categories?searchTerm=${searchText}`

  return httpGet(url).then(
    ({ body }) => ({
      categories: body.categories,
    }),
  ).catch((reason) => { throw { error: 'FAILED', reason } })
}

function fetchWikiPage ({ title, wikiSource }) {
  let url = `/api/wiki?title=${encodeURIComponent(title)}`;

  if (wikiSource) {
    url += `&wikiSource=${wikiSource}`
  }

  return httpGet(url).then(
    ({ body }) => ({
      wikiContent: body.wikiContent ? body.wikiContent : JSON.stringify(body),
      wikiSource: body.wikiSource ? body.wikiSource : '',
    }),
  )
}

function convertWiki ({ title, wikiSource }) {
  let url = `/api/wiki/convert?title=${encodeURIComponent(title)}`;

  if (wikiSource) {
    url += `&wikiSource=${wikiSource}`
  }

  return httpGet(url).then(
    ({ body }) => ({
      wikiConvert: body,
    }),
  ).catch((reason) => { throw { error: 'FAILED', reason } })
}

function getConversionStatus ({ title }) {
  const url = `/api/wiki/convert/status?title=${encodeURIComponent(title)}`
  return httpGet(url).then(
    ({ body }) => ({
      wikiProgress: body,
    }),
  )
}

function getInfobox ({ title, wikiSource }) {
  let url = `/api/wiki/infobox?title=${encodeURIComponent(title)}`

  if (wikiSource) {
    url += `&wikiSource=${wikiSource}`
  }

  return httpGet(url).then(
    ({ body }) => ({
      infobox: body.infobox,
    }),
  ).catch((reason) => { throw { error: 'FAILED', reason } })
}

function getArticleForms ({ title }) {
  const url = `/api/wiki/forms?title=${title}`;

  return httpGet(url).then(
    ({ body }) => ({
      forms: body.forms,
    }),
    ).catch((reason) => { throw { error: 'FAILED', reason } });
}
export default {
  searchWiki,
  fetchWikiPage,
  convertWiki,
  getConversionStatus,
  getInfobox,
  getArticleForms,
  fetchImagesFromWikimediaCommons,
  fetchGifsFromWikimediaCommons,
  fetchVideosFromWikimediaCommons,
  fetchCategoriesFromWikimediaCommons,
}
