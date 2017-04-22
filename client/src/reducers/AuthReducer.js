import { mergeImmutable } from '../utils'
import actions from '../actions/AuthActionCreators'

const initialState = {
  signupState: 'loading',
  signupStatus: null,
}

const handlers = {
  [actions.SIGNUP_REQUEST]: (state) =>
    mergeImmutable(state, {
      signupState: 'loading',
      signupStatus: null,
    }),

  [actions.SIGNUP_RECEIVE]: (state, action) =>
    mergeImmutable(state, {
      signupState: 'done',
      signupStatus: action.signupStatus,
    }),

  [actions.SIGNUP_FAILED]: (state) =>
    mergeImmutable(state, {
      signupState: 'failed',
      signupStatus: null,
    }),
}

export default (reducer) =>
  (state = initialState, action) =>
    reducer(handlers, state, action)
