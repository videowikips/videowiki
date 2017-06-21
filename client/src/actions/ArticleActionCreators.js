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

registerAsyncAction(ArticleAPI, 'fetchArticle')
registerAsyncAction(ArticleAPI, 'uploadContent')
registerAsyncAction(ArticleAPI, 'uploadImageUrl')
registerAsyncAction(ArticleAPI, 'fetchTopArticles')
registerAsyncAction(ArticleAPI, 'fetchConversionProgress')
registerAsyncAction(ArticleAPI, 'publishArticle')
registerAsyncAction(ArticleAPI, 'fetchContributors')
registerAsyncAction(ArticleAPI, 'fetchArticleCount')
registerAsyncAction(ArticleAPI, 'fetchAllArticles')
registerAsyncAction(ArticleAPI, 'fetchImagesFromBing')

export default actions
