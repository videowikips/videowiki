import _ from 'lodash'
import {
  registerAction as unboundRegisterAction,
} from './ActionUtils'

const actions = {}

const registerAction = _.partial(unboundRegisterAction, actions)

registerAction('SHOW_REOPEN_FORM_NOTIFICATION', ['show']);
registerAction('SET_LANGUAGE', ['language'])
registerAction('CLOSE_BETA_DISCLAIMER')
registerAction('SET_WIKI', ['wiki']);

export default actions
