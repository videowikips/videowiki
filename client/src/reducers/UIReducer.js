import { mergeImmutable } from '../utils'
import actions from '../actions/UIActionCreators'

const initialState = {
  showReopenFormNotification: true,
  showBetaDisclaimer: true,
  language: 'en',
  wiki: undefined,
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
  [actions.SET_LANGUAGE]: (state, action) =>
    mergeImmutable(state, {
      language: action.language,
    }),
  [actions.SET_WIKI]: (state, action) =>
    mergeImmutable(state, {
      wiki: action.wiki,
    }),
}

export default (reducer) =>
  (state = initialState, action) =>
    reducer(handlers, state, action)
