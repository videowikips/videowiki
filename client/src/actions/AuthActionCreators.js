import _ from 'lodash'

import AuthAPI from '../apis/AuthAPI'

import {
  // registerAction as unboundRegisterAction,
  registerAsyncAction as unboundRegisterAsyncAction,
} from './ActionUtils'

const actions = {}

// const registerAction = _.partial(unboundRegisterAction, actions)
const registerAsyncAction = _.partial(unboundRegisterAsyncAction, actions)

// Bulk Entity
// registerAction('SELECT_PUBLISHER', ['publisher'])

registerAsyncAction(AuthAPI, 'signup')
registerAsyncAction(AuthAPI, 'login')

export default actions
