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

export default {
  searchWiki,
  fetchWikiPage,
}
