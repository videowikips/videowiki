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
  /*
    Persists the values in the upload form for each slide
    Format:
    uploadToCommonsForms: {
      [articleId]: {
        [slideIndex]: {
          [field]: value
        }
      }
    }
  */
  uploadToCommonsForms: {},
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
      wikiSource: action.wikiSource,
    }),

  [actions.FETCH_WIKI_PAGE_FAILED]: (state) =>
    mergeImmutable(state, {
      wikiContentState: 'failed',
      wikiContent: '',
      wikiSource: '',
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

  [actions.UPDATE_COMMONS_UPLOAD_FORM_FIELD]: (state, { articleId, slideIndex, update }) =>
    mergeImmutable(state, {
      uploadToCommonsForms: {
        ...state.uploadToCommonsForms,
        [articleId]: {
          ...(state.uploadToCommonsForms[articleId] || {}),
          [slideIndex]: {
            ...(state.uploadToCommonsForms[articleId] && state.uploadToCommonsForms[articleId][slideIndex]) || {},
            ...update,
          },
        },
      },
    }),

}

export default (reducer) =>
  (state = initialState, action) =>
    reducer(handlers, state, action)
