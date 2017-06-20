import { httpGet } from './Common'

function searchWiki ({ searchText }) {
  const url = `/api/wiki/search?searchTerm=${encodeURIComponent(searchText)}`
  return httpGet(url).then(
    ({ body }) => ({
      searchResults: body.searchResults,
    }),
  )
}

function fetchWikiPage ({ title }) {
  const url = `/api/wiki?title=${encodeURIComponent(title)}`
  return httpGet(url).then(
    ({ text }) => ({
      wikiContent: text,
    }),
  )
}

function convertWiki ({ title }) {
  const url = `/api/wiki/convert?title=${encodeURIComponent(title)}`
  return httpGet(url).then(
    ({ body }) => ({
      wikiConvert: body,
    }),
  )
}

function getConversionStatus ({ title }) {
  const url = `/api/wiki/convert/status?title=${encodeURIComponent(title)}`
  return httpGet(url).then(
    ({ body }) => ({
      wikiProgress: body,
    }),
  )
}

function getInfobox ({ title }) {
  const url = `/api/wiki/infobox?title=${encodeURIComponent(title)}`

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
