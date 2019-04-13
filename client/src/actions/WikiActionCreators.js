import _ from 'lodash'

import WikiAPI from '../apis/WikiAPI'

import {
  registerAction as unboundRegisterAction,
  registerAsyncAction as unboundRegisterAsyncAction,
} from './ActionUtils'

const actions = {}

const registerAction = _.partial(unboundRegisterAction, actions)
const registerAsyncAction = _.partial(unboundRegisterAsyncAction, actions)

registerAction('RESET_SEARCH_BAR')
registerAction('UPDATE_COMMONS_UPLOAD_FORM_FIELD', ['articleId', 'slideIndex', 'update'])
registerAction('CLEAR_SLIDE_FORM', ['articleId', 'slideIndex'])

registerAsyncAction(WikiAPI, 'searchWiki')
registerAsyncAction(WikiAPI, 'fetchWikiPage')
registerAsyncAction(WikiAPI, 'convertWiki')
registerAsyncAction(WikiAPI, 'getConversionStatus')
registerAsyncAction(WikiAPI, 'getInfobox')
registerAsyncAction(WikiAPI, 'getArticleForms')

registerAsyncAction(WikiAPI, 'fetchCategoriesFromWikimediaCommons')
registerAsyncAction(WikiAPI, 'fetchImagesFromWikimediaCommons')
registerAsyncAction(WikiAPI, 'fetchGifsFromWikimediaCommons')
registerAsyncAction(WikiAPI, 'fetchVideosFromWikimediaCommons')

export default actions
