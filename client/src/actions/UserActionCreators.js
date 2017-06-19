import _ from 'lodash'

import UserAPI from '../apis/UserAPI'

import {
  registerAsyncAction as unboundRegisterAsyncAction,
} from './ActionUtils'

const actions = {}

const registerAsyncAction = _.partial(unboundRegisterAsyncAction, actions)

registerAsyncAction(UserAPI, 'fetchLeaderboard')

export default actions
