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

registerAsyncAction(ArticleAPI, 'fetchArticle')
registerAsyncAction(ArticleAPI, 'uploadContent')
registerAsyncAction(ArticleAPI, 'fetchTopArticles')
registerAsyncAction(ArticleAPI, 'fetchConversionProgress')
registerAsyncAction(ArticleAPI, 'publishArticle')

export default actions
