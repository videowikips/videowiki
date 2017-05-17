import { mergeImmutable } from '../utils'
import actions from '../actions/ArticleActionCreators'

const initialState = {
  fetchArticleState: 'loading',
  article: null,
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
}

export default (reducer) =>
  (state = initialState, action) =>
    reducer(handlers, state, action)
