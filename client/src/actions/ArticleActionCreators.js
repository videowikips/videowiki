import _ from 'lodash'

import ArticleAPI from '../apis/ArticleAPI'

import {
  registerAction as unboundRegisterAction,
  registerAsyncAction as unboundRegisterAsyncAction,
} from './ActionUtils'

const actions = {}

const registerAction = _.partial(unboundRegisterAction, actions)
const registerAsyncAction = _.partial(unboundRegisterAsyncAction, actions)

registerAction('RESET_PUBLISH_ERROR')
registerAction('RESET_UPLOAD_STATE')
registerAction('UPDATE_ARTICLE', ['article'])
registerAction('UPDATE_PROGRESS', ['progress'])
registerAction('SET_PLAYBACK_SPEED', ['playbackSpeed'])

registerAction('UPLOAD_CONTENT_REQUEST')
registerAction('UPLOAD_CONTENT_RECEIVE', ['uploadStatus'])
registerAction('UPLOAD_CONTENT_FAILED')
registerAction('CLEAR_CONVERSION_PROGRESS')

registerAsyncAction(ArticleAPI, 'fetchArticle')
registerAsyncAction(ArticleAPI, 'uploadContent')
registerAsyncAction(ArticleAPI, 'uploadImageUrl')
registerAsyncAction(ArticleAPI, 'fetchTopArticles')
registerAsyncAction(ArticleAPI, 'fetchConversionProgress')
registerAsyncAction(ArticleAPI, 'publishArticle')
registerAsyncAction(ArticleAPI, 'fetchContributors')
registerAsyncAction(ArticleAPI, 'fetchArticleCount')
registerAsyncAction(ArticleAPI, 'fetchAllArticles')
registerAsyncAction(ArticleAPI, 'fetchDeltaArticles')

registerAsyncAction(ArticleAPI, 'fetchImagesFromBing')
registerAsyncAction(ArticleAPI, 'fetchGifsFromGiphy')
registerAsyncAction(ArticleAPI, 'fetchAudioFileInfo')
registerAsyncAction(ArticleAPI, 'fetchArticleVideo');
registerAsyncAction(ArticleAPI, 'fetchArticleVideoByArticleVersion');
registerAsyncAction(ArticleAPI, 'fetchVideoByArticleTitle');
registerAsyncAction(ArticleAPI, 'updateSlideMediaDurations');
registerAsyncAction(ArticleAPI, 'uploadSlideAudio');

export default actions
