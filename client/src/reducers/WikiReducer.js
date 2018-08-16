import { mergeImmutable } from '../utils'
import actions from '../actions/WikiActionCreators'

const initialState = {
  isSearchResultLoading: false,
  searchResults: [],
  searchResultState: 'loading',
  wikiContentState: 'loading',
  wikiContent: '',
  wikiSource: '',
  convertState: 'loading',
  convertError: null,
  infoboxState: 'loading',
  infobox: null,
}

const handlers = {
  [actions.SEARCH_WIKI_REQUEST]: (state) =>
    mergeImmutable(state, {
      isSearchResultLoading: true,
      searchResultState: 'loading',
    }),

  [actions.SEARCH_WIKI_RECEIVE]: (state, action) =>
    mergeImmutable(state, {
      isSearchResultLoading: false,
      searchResults: action.searchResults,
      searchResultState: 'done',
    }),

  [actions.SEARCH_WIKI_FAILED]: (state) =>
    mergeImmutable(state, {
      isSearchResultLoading: false,
      searchResultState: 'failed',
      searchResults: [],
    }),

  [actions.RESET_SEARCH_BAR]: (state) =>
    mergeImmutable(state, {
      isSearchResultLoading: false,
      searchResultState: 'loading',
      searchResults: [],
    }),

  [actions.FETCH_WIKI_PAGE_REQUEST]: (state) =>
    mergeImmutable(state, {
      wikiContentState: 'loading',
      wikiContent: '',
      wikiSource: '',
    }),

  [actions.FETCH_WIKI_PAGE_RECEIVE]: (state, action) =>
    mergeImmutable(state, {
      wikiContentState: 'done',
      wikiContent: action.wikiContent,
      wikiSource: action.wikiSource
    }),

  [actions.FETCH_WIKI_PAGE_FAILED]: (state) =>
    mergeImmutable(state, {
      wikiContentState: 'failed',
      wikiContent: '',
      wikiSource: ''
    }),

  // ==== convert to video wiki
  [actions.CONVERT_WIKI_REQUEST]: (state) =>
    mergeImmutable(state, {
      convertState: 'loading',
    }),

  [actions.CONVERT_WIKI_RECEIVE]: (state) =>
    mergeImmutable(state, {
      convertState: 'done',
    }),

  [actions.CONVERT_WIKI_FAILED]: (state, action) =>
    mergeImmutable(state, {
      convertState: 'failed',
      convertError: action.reason,
    }),

  // ==== infobox
  [actions.GET_INFOBOX_REQUEST]: (state) =>
    mergeImmutable(state, {
      infoboxState: 'loading',
    }),

  [actions.GET_INFOBOX_RECEIVE]: (state, action) =>
    mergeImmutable(state, {
      infoboxState: 'done',
      infobox: action.infobox,
    }),

  [actions.GET_INFOBOX_FAILED]: (state) =>
    mergeImmutable(state, {
      infoboxState: 'failed',
    }),
}

export default (reducer) =>
  (state = initialState, action) =>
    reducer(handlers, state, action)
