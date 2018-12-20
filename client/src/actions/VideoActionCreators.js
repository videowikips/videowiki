import _ from 'lodash'

import VideosApi from '../apis/VideoApi'

import {
  // registerAction as unboundRegisterAction,
  registerAsyncAction as unboundRegisterAsyncAction,
} from './ActionUtils'

const actions = {}

// const registerAction = _.partial(unboundRegisterAction, actions)
const registerAsyncAction = _.partial(unboundRegisterAsyncAction, actions)

// Bulk Entity

registerAsyncAction(VideosApi, 'exportArticleToVideo')

export default actions
