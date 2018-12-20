import { mergeImmutable } from '../utils'
import actions from '../actions/VideoActionCreators'

const initialState = {
  exportArticleToVideoState: 'done',
}

const handlers = {
  [actions.EXPORT_ARTICLE_TO_VIDEO_REQUEST]: (state) =>
    mergeImmutable(state, {
      exportArticleToVideoState: 'loading',
    }),

  [actions.EXPORT_ARTICLE_TO_VIDEO_RECEIVE]: (state) =>
    mergeImmutable(state, {
      exportArticleToVideoState: 'done',
    }),

  [actions.EXPORT_ARTICLE_TO_VIDEO_FAILED]: (state, action) =>
    mergeImmutable(state, {
      exportArticleToVideoState: 'failed',
      error: action.text,
    }),
}

export default (reducer) =>
  (state = initialState, action) =>
    reducer(handlers, state, action)
