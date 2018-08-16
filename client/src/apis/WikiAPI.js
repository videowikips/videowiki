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

function fetchWikiPage ({ title, wikiSource }) {
  let url = `/api/wiki?title=${encodeURIComponent(title)}`;

  if (wikiSource) {
    url += `&wikiSource=${wikiSource}`
  }

  return httpGet(url).then(
    ({ body }) => ({
      wikiContent: body.wikiContent,
      wikiSource: body.wikiSource
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

export default {
  searchWiki,
  fetchWikiPage,
  convertWiki,
  getConversionStatus,
  getInfobox,
}
