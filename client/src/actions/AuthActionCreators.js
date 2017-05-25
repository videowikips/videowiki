import _ from 'lodash'

import AuthAPI from '../apis/AuthAPI'

import {
  registerAction as unboundRegisterAction,
  registerAsyncAction as unboundRegisterAsyncAction,
} from './ActionUtils'

const actions = {}

const registerAction = _.partial(unboundRegisterAction, actions)
const registerAsyncAction = _.partial(unboundRegisterAsyncAction, actions)

// Bulk Entity
registerAction('RESET_SIGNUP_ERROR')
registerAction('RESET_LOGIN_ERROR')

registerAsyncAction(AuthAPI, 'signup')
registerAsyncAction(AuthAPI, 'login')

export default actions
