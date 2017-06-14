import { mergeImmutable } from '../utils'
import actions from '../actions/ArticleActionCreators'

const initialState = {
  fetchArticleState: 'loading',
  article: null,
  topArticlesState: 'loading',
  topArticles: [],
  conversionPercentage: {},
  conversionPercentageState: 'loading',
}

const handlers = {
  [actions.FETCH_ARTICLE_REQUEST]: (state) =>
    mergeImmutable(state, {
      fetchArticleState: 'loading',
      article: null,
    }),

  [actions.FETCH_ARTICLE_RECEIVE]: (state, action) =>
    mergeImmutable(state, {
      fetchArticleState: 'done',
      article: action.article,
    }),

  [actions.FETCH_ARTICLE_FAILED]: (state) =>
    mergeImmutable(state, {
      fetchArticleState: 'failed',
      article: null,
    }),

  [actions.UPLOAD_CONTENT_REQUEST]: (state) =>
    mergeImmutable(state, {
      uploadStatus: null,
    }),

  [actions.UPLOAD_CONTENT_RECEIVE]: (state, action) =>
    mergeImmutable(state, {
      uploadStatus: action.uploadStatus,
    }),

  [actions.UPLOAD_CONTENT_FAILED]: (state) =>
    mergeImmutable(state, {
      uploadStatus: null,
    }),

  // =============
  [actions.FETCH_TOP_ARTICLES_REQUEST]: (state) =>
    mergeImmutable(state, {
      topArticlesState: 'loading',
      topArticles: [],
    }),

  [actions.FETCH_TOP_ARTICLES_RECEIVE]: (state, action) =>
    mergeImmutable(state, {
      topArticlesState: 'done',
      topArticles: action.articles,
    }),

  [actions.FETCH_TOP_ARTICLES_FAILED]: (state, action) =>
    mergeImmutable(state, {
      topArticlesState: 'failed',
      topArticles: action.reason,
    }),

  // =============
  [actions.FETCH_CONVERSION_PROGRESS_REQUEST]: (state) =>
    mergeImmutable(state, {
      conversionPercentageState: 'loading',
    }),

  [actions.FETCH_CONVERSION_PROGRESS_RECEIVE]: (state, action) =>
    mergeImmutable(state, {
      conversionPercentage: action,
      conversionPercentageState: 'done',
    }),

  [actions.FETCH_CONVERSION_PROGRESS_FAILED]: (state) =>
    mergeImmutable(state, {
      conversionPercentageState: 'failed',
    }),
}

export default (reducer) =>
  (state = initialState, action) =>
    reducer(handlers, state, action)
