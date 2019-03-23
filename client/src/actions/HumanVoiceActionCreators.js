import _ from 'lodash'

import HumanVoiceApi from '../apis/HumanVoiceApi'

import {
  // registerAction as unboundRegisterAction,
  registerAsyncAction as unboundRegisterAsyncAction,
} from './ActionUtils'

const actions = {}

// const registerAction = _.partial(unboundRegisterAction, actions)
const registerAsyncAction = _.partial(unboundRegisterAsyncAction, actions)

// Bulk Entity
// registerAction('CLEAR_VIDEO')

registerAsyncAction(HumanVoiceApi, 'uploadSlideAudio');
registerAsyncAction(HumanVoiceApi, 'fetchArticleHumanVoice');
registerAsyncAction(HumanVoiceApi, 'deleteCustomAudio');

export default actions