import { mergeImmutable } from '../utils'
import actions from '../actions/VideoActionCreators'

const initialState = {
  exportArticleToVideoState: 'done',
  videosHistory: {
    fetchVideosHistoryState: 'done',
    videos: [],
  },
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
  [actions.FETCH_VIDEO_HISTORY_REQUETS]: (state) =>
    mergeImmutable(state, {
      videosHistory: {
        fetchVideosHistoryState: 'loading',
        videos: [],
      },
    }),
  [actions.FETCH_VIDEO_HISTORY_RECEIVE]: (state, action) =>
  mergeImmutable(state, {
    videosHistory: {
      fetchVideosHistoryState: 'done',
      videos: action.videos,
    },
  }),
  [actions.FETCH_VIDEO_HISTORY_FAILED]: (state) =>
  mergeImmutable(state, {
    videosHistory: {
      fetchVideosHistoryState: 'failed',
      videos: [],
    },
  }),

}

export default (reducer) =>
  (state = initialState, action) =>
    reducer(handlers, state, action)
