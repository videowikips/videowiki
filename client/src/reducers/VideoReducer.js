import { mergeImmutable } from '../utils'
import actions from '../actions/VideoActionCreators'

const initialState = {
  exportArticleToVideoState: 'done',
  video: {},
  videosHistory: {
    fetchVideosHistoryState: 'done',
    videos: [],
  },
  videoConvertProgress: {
    videoConvertProgressState: 'done',
    video: {},
  },
}

const handlers = {
  [actions.EXPORT_ARTICLE_TO_VIDEO_REQUEST]: (state) =>
    mergeImmutable(state, {
      exportArticleToVideoState: 'loading',
    }),

  [actions.EXPORT_ARTICLE_TO_VIDEO_RECEIVE]: (state, action) =>
    mergeImmutable(state, {
      exportArticleToVideoState: 'done',
      video: action.video,
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
  [actions.FETCH_VIDEO_REQUEST]: (state) =>
    mergeImmutable(state, {
      videoConvertProgress: {
        ...state.videoConvertProgress,
        videoConvertProgressState: 'loading',
      },
    }),
  [actions.FETCH_VIDEO_RECEIVE]: (state, action) =>
    mergeImmutable(state, {
      videoConvertProgress: {
        ...state.videoConvertProgress,
        videoConvertProgressState: 'done',
        video: action.video,
      },
    }),

  [actions.FETCH_VIDEO_FAILED]: (state) =>
    mergeImmutable(state, {
      videoConvertProgress: {
        videoConvertProgressState: 'failed',
      },
    }),
}

export default (reducer) =>
  (state = initialState, action) =>
    reducer(handlers, state, action)
