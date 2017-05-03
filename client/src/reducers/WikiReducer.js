import { mergeImmutable } from '../utils'
import actions from '../actions/WikiActionCreators'

const initialState = {
  isSearchResultLoading: false,
  searchResults: [],
  searchResultState: 'loading',
  wikiContentState: 'loading',
  wikiContent: '',
  convertState: 'loading',
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
    }),

  [actions.FETCH_WIKI_PAGE_RECEIVE]: (state, action) =>
    mergeImmutable(state, {
      wikiContentState: 'done',
      wikiContent: action.wikiContent,
    }),

  [actions.FETCH_WIKI_PAGE_FAILED]: (state) =>
    mergeImmutable(state, {
      wikiContentState: 'failed',
      wikiContent: '',
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

  [actions.CONVERT_WIKI_FAILED]: (state) =>
    mergeImmutable(state, {
      convertState: 'failed',
    }),
}

export default (reducer) =>
  (state = initialState, action) =>
    reducer(handlers, state, action)
