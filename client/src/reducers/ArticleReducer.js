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
  fetchCategoriesFromWikimediaCommonsState: 'done',
  fetchImagesFromWikimediaCommonsState: 'done',
  fetchGifsFromWikimediaCommonsState: 'done',
  fetchVideosFromWikimediaCommonsState: 'done',
  searchCategories: [],
  searchImages: [],
  searchGifs: [],
  searchVideos: [],
  uploadState: 'done',
  uploadStatus: null,
  uploadProgress: 0,
  playbackSpeed: 1,
  fetchAudioFileInfoState: 'done',
  audioInfo: {},
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

  [actions.FETCH_CATEGORIES_FROM_WIKIMEDIA_COMMONS_REQUEST]: (state) =>
    mergeImmutable(state, {
      fetchCategoriesFromWikimediaCommonsState: 'loading',
    }),
  [actions.FETCH_CATEGORIES_FROM_WIKIMEDIA_COMMONS_RECEIVE]: (state, action) =>
    mergeImmutable(state, {
      fetchCategoriesFromWikimediaCommonsState: 'done',
      searchCategories: action.categories,
    }),
  [actions.FETCH_CATEGORIES_FROM_WIKIMEDIA_COMMONS_FAILED]: (state) =>
    mergeImmutable(state, {
      fetchCategoriesFromWikimediaCommonsState: 'failed',
    }),
  // =============
  [actions.FETCH_IMAGES_FROM_WIKIMEDIA_COMMONS_REQUEST]: (state) =>
    mergeImmutable(state, {
      fetchImagesFromWikimediaCommonsState: 'loading',
    }),
  [actions.FETCH_IMAGES_FROM_WIKIMEDIA_COMMONS_RECEIVE]: (state, action) =>
    mergeImmutable(state, {
      fetchImagesFromWikimediaCommonsState: 'done',
      searchImages: action.images,
    }),
  [actions.FETCH_IMAGES_FROM_WIKIMEDIA_COMMONS_FAILED]: (state) =>
    mergeImmutable(state, {
      fetchImagesFromWikimediaCommonsState: 'failed',
    }),

  [actions.FETCH_GIFS_FROM_WIKIMEDIA_COMMONS_REQUEST]: (state) =>
    mergeImmutable(state, {
      fetchGifsFromWikimediaCommonsState: 'loading',
    }),

  [actions.FETCH_GIFS_FROM_WIKIMEDIA_COMMONS_RECEIVE]: (state, action) =>
    mergeImmutable(state, {
      fetchGifsFromWikimediaCommonsState: 'done',
      searchGifs: action.gifs,
    }),

  [actions.FETCH_GIFS_FROM_WIKIMEDIA_COMMONS_FAILED]: (state) =>
    mergeImmutable(state, {
      fetchGifsFromWikimediaCommonsState: 'failed',
    }),
  // =============
  [actions.FETCH_VIDEOS_FROM_WIKIMEDIA_COMMONS_REQUEST]: (state) =>
    mergeImmutable(state, {
      fetchVideosFromWikimediaCommonsState: 'loading',
    }),

  [actions.FETCH_VIDEOS_FROM_WIKIMEDIA_COMMONS_RECEIVE]: (state, action) =>
    mergeImmutable(state, {
      fetchVideosFromWikimediaCommonsState: 'done',
      searchVideos: action.videos,
    }),

  [actions.FETCH_VIDEOS_FROM_WIKIMEDIA_COMMONS_FAILED]: (state) =>
    mergeImmutable(state, {
      fetchVideosFromWikimediaCommonsState: 'failed',
    }),
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
}

export default (reducer) =>
  (state = initialState, action) =>
    reducer(handlers, state, action)
