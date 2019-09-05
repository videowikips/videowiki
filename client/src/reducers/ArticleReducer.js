import { mergeImmutable } from '../utils'
import actions from '../actions/ArticleActionCreators'

const initialState = {
  fetchArticleState: 'loading',
  article: null,
  topArticlesState: 'loading',
  topArticles: [],
  conversionPercentage: {},
  conversionPercentageState: 'loading',
  publishArticleState: 'done',
  publishArticleStatus: null,
  publishArticleError: null,
  fetchContributorsState: 'loading',
  fetchArticleCountState: 'loading',
  articleCount: 0,
  fetchAllArticlesState: 'loading',
  fetchDeltaArticlesState: 'done',
  allArticles: [],
  deltaArticles: [],
  uploadState: 'done',
  uploadStatus: null,
  uploadProgress: 0,
  playbackSpeed: 1,
  fetchAudioFileInfoState: 'done',
  audioInfo: {},
  fetchArticleVideoState: 'done',
  uploadSlideAudioLoadingState: 'done',
  uploadSlideAudioError: '',
  articleVideo: {
    video: {},
    exported: false,
  },
  articleLastVideo: null,
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
      uploadState: 'loading',
      uploadStatus: null,
    }),

  [actions.UPLOAD_CONTENT_RECEIVE]: (state, action) =>
    mergeImmutable(state, {
      uploadState: 'done',
      uploadStatus: action.uploadStatus,
    }),

  [actions.UPLOAD_CONTENT_FAILED]: (state) =>
    mergeImmutable(state, {
      uploadState: 'failed',
      uploadStatus: null,
    }),

  // ===========
  [actions.UPDATE_UPLOAD_STATUS]: (state, action) =>
    mergeImmutable(state, {
      uploadState: action.state,
      uploadStatus: action.status,
    }),

  [actions.UPDATE_PROGRESS]: (state, action) =>
    mergeImmutable(state, {
      uploadProgress: action.progress,
    }),

  [actions.REST_UPLOAD]: (state) =>
    mergeImmutable(state, {
      uploadProgress: 0,
      uploadState: 'done',
      uploadStatus: null,
    }),

  // ===========
  [actions.UPLOAD_IMAGE_URL_REQUEST]: (state) =>
    mergeImmutable(state, {
      uploadState: 'loading',
      uploadStatus: null,
    }),

  [actions.UPLOAD_IMAGE_URL_RECEIVE]: (state, action) =>
    mergeImmutable(state, {
      uploadState: 'done',
      uploadStatus: action.uploadStatus,
    }),

  [actions.UPLOAD_IMAGE_URL_FAILED]: (state) =>
    mergeImmutable(state, {
      uploadState: 'failed',
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

  [actions.CLEAR_CONVERSION_PROGRESS]: (state) =>
    mergeImmutable(state, {
      conversionPercentageState: 'loading',
      conversionPercentage: {
        progress: 0,
        converted: false,
        title: '',
      },
    }),
  // =============
  [actions.PUBLISH_ARTICLE_REQUEST]: (state) =>
    mergeImmutable(state, {
      publishArticleState: 'loading',
      publishArticleStatus: null,
      publishArticleError: null,
    }),

  [actions.PUBLISH_ARTICLE_RECEIVE]: (state, action) =>
    mergeImmutable(state, {
      publishArticleStatus: action,
      publishArticleState: 'done',
    }),

  [actions.PUBLISH_ARTICLE_FAILED]: (state, action) =>
    mergeImmutable(state, {
      publishArticleState: 'failed',
      publishArticleError: action.reason,
    }),

  // =============
  [actions.FETCH_CONTRIBUTORS_REQUEST]: (state) =>
    mergeImmutable(state, {
      fetchContributorsState: 'loading',
    }),

  [actions.FETCH_CONTRIBUTORS_RECEIVE]: (state, action) =>
    mergeImmutable(state, {
      fetchContributorsState: 'done',
      contributors: action.contributors,
    }),

  [actions.FETCH_CONTRIBUTORS_FAILED]: (state) =>
    mergeImmutable(state, {
      fetchContributorsState: 'failed',
    }),

  // ================
  [actions.RESET_PUBLISH_ERROR]: (state) =>
    mergeImmutable(state, {
      publishArticleStatus: null,
      publishArticleError: null,
      publishArticleState: 'done',
    }),

  // ================
  [actions.RESET_UPLOAD_STATE]: (state) =>
    mergeImmutable(state, {
      uploadState: 'done',
      uploadStatus: null,
    }),

  // ================
  [actions.SET_PLAYBACK_SPEED]: (state, action) =>
    mergeImmutable(state, {
      playbackSpeed: action.playbackSpeed,
    }),

  // ================
  [actions.UPDATE_ARTICLE]: (state, action) =>
    mergeImmutable(state, {
      article: action.article,
    }),

  // =============
  [actions.FETCH_ARTICLE_COUNT_REQUEST]: (state) =>
    mergeImmutable(state, {
      fetchArticleCountState: 'loading',
    }),

  [actions.FETCH_ARTICLE_COUNT_RECEIVE]: (state, action) =>
    mergeImmutable(state, {
      fetchArticleCountState: 'done',
      articleCount: action.count,
    }),

  [actions.FETCH_ARTICLE_COUNT_FAILED]: (state) =>
    mergeImmutable(state, {
      fetchArticleCountState: 'failed',
    }),

  // =============
  [actions.FETCH_ALL_ARTICLES_REQUEST]: (state) =>
    mergeImmutable(state, {
      fetchAllArticlesState: 'loading',
    }),

  [actions.FETCH_ALL_ARTICLES_RECEIVE]: (state, action) =>
    mergeImmutable(state, {
      fetchAllArticlesState: 'done',
      deltaArticles: action.articles,
      allArticles: state.allArticles.concat(action.articles),
    }),

  [actions.FETCH_ALL_ARTICLES_FAILED]: (state) =>
    mergeImmutable(state, {
      fetchAllArticlesState: 'failed',
    }),

  // =============
  [actions.FETCH_DELTA_ARTICLES_REQUEST]: (state) =>
    mergeImmutable(state, {
      fetchDeltaArticlesState: 'loading',
      deltaArticles: [],
    }),

  [actions.FETCH_DELTA_ARTICLES_RECEIVE]: (state, action) =>
    mergeImmutable(state, {
      fetchDeltaArticlesState: 'done',
      deltaArticles: action.articles,
      allArticles: state.allArticles.concat(action.articles),
    }),

  [actions.FETCH_DELTA_ARTICLES_FAILED]: (state) =>
    mergeImmutable(state, {
      fetchDeltaArticlesState: 'failed',
      deltaArticles: [],
    }),
  // =============
  [actions.FETCH_AUDIO_FILE_INFO_REQUEST]: (state) =>
    mergeImmutable(state, {
      fetchAudioFileInfoState: 'loading',
    }),

  [actions.FETCH_AUDIO_FILE_INFO_RECEIVE]: (state, action) =>
    mergeImmutable(state, {
      fetchAudioFileInfoState: 'done',
      audioInfo: action.audioInfo,
    }),

  [actions.FETCH_AUDIO_FILE_INFO_FAILED]: (state) =>
    mergeImmutable(state, {
      fetchAudioFileInfoState: 'failed',
    }),
  // fetchArticleVideo
  [actions.FETCH_ARTICLE_VIDEO_REQUEST]: (state) =>
    mergeImmutable(state, {
      fetchArticleVideoState: 'loading',
      articleVideo: {
        video: {},
        exported: false,
      },
    }),
  [actions.FETCH_ARTICLE_VIDEO_RECEIVE]: (state, action) =>
    mergeImmutable(state, {
      fetchArticleVideoState: 'done',
      articleVideo: {
        video: action.video,
        exported: action.exported,
      },
    }),
  [actions.FETCH_ARTICLE_VIDEO_FAILED]: (state) =>
    mergeImmutable(state, {
      fetchArticleVideoState: 'failed',
      articleVideo: {
        video: {},
        exported: false,
      },
    }),
  // fetchArticleVideoByArticleVersion
  [actions.FETCH_ARTICLE_VIDEO_BY_ARTICLE_VERSION_REQUEST]: (state) =>
  mergeImmutable(state, {
    fetchArticleVideoState: 'loading',
    articleVideo: {
      video: {},
      exported: false,
    },
  }),
  [actions.FETCH_ARTICLE_VIDEO_BY_ARTICLE_VERSION_RECEIVE]: (state, action) =>
  mergeImmutable(state, {
    fetchArticleVideoState: 'done',
    articleVideo: {
      video: action.video,
      exported: action.exported,
    },
  }),
  [actions.FETCH_ARTICLE_VIDEO_BY_ARTICLE_VERSION_FAILED]: (state) =>
  mergeImmutable(state, {
    fetchArticleVideoState: 'failed',
    articleVideo: {
      video: {},
      exported: false,
    },
  }),
  [actions.FETCH_VIDEO_BY_ARTICLE_TITLE_REQUEST]: (state) =>
  mergeImmutable(state, {
    articleLastVideo: null,
  }),
  [actions.FETCH_VIDEO_BY_ARTICLE_TITLE_RECEIVE]: (state, action) =>
      mergeImmutable(state, {
        articleLastVideo: action.video,
      }),
  [actions.FETCH_VIDEO_BY_ARTICLE_TITLE_FAILED]: (state) =>
    mergeImmutable(state, {
      articleLastVideo: null,
    }),
  [actions.UPDATE_SLIDE_MEDIA_DURATIONS_RECEIVE]: (state, action) => {
    const { article } = state;
    const { durations, slideNumber } = action;
    durations.forEach((duration, index) => {
      article.slides[slideNumber].media[index].time = duration;
      article.slidesHtml[slideNumber].media[index].time = duration;
    })
    return mergeImmutable(state, { article });
  },
  // Upload audio for custom VW
  [actions.UPLOAD_SLIDE_AUDIO_REQUEST]: (state) =>
    mergeImmutable(state, {
      uploadSlideAudioLoadingState: 'loading',
      uploadSlideAudioError: '',
    }),

  [actions.UPLOAD_SLIDE_AUDIO_FAILED]: (state, action) => {
    console.log('action', action, action.reason)
    const err = action.reason && action.reason.response && action.reason.response.text ? action.reason.response.text : 'Something went wrong';
    return mergeImmutable(state, {
      uploadSlideAudioLoadingState: 'failed',
      uploadSlideAudioError: err,
    })
  },
  [actions.UPLOAD_SLIDE_AUDIO_RECEIVE]: (state, action) => {
    const { article } = action;
    return mergeImmutable(state, {
      uploadSlideAudioLoadingState: 'done',
      uploadSlideAudioError: '',
      article,
    });
  },
}

export default (reducer) =>
  (state = initialState, action) =>
    reducer(handlers, state, action)
