import { mergeImmutable } from '../utils'
import actions from '../actions/UIActionCreators'

const initialState = {
  showReopenFormNotification: true,
  showBetaDisclaimer: true,
}

const handlers = {
  [actions.SHOW_REOPEN_FORM_NOTIFICATION]: (state, action) =>
    mergeImmutable(state, {
      showReopenFormNotification: action.show,
    }),
  [actions.CLOSE_BETA_DISCLAIMER]: (state) =>
    mergeImmutable(state, {
      showBetaDisclaimer: false,
    }),
}

export default (reducer) =>
  (state = initialState, action) =>
    reducer(handlers, state, action)
