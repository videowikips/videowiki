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

registerAsyncAction(WikiAPI, 'searchWiki')
registerAsyncAction(WikiAPI, 'fetchWikiPage')
registerAsyncAction(WikiAPI, 'convertWiki')
registerAsyncAction(WikiAPI, 'getConversionStatus')
registerAsyncAction(WikiAPI, 'getInfobox')

export default actions
