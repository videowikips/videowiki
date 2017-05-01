import { mergeImmutable } from '../utils'
import actions from '../actions/AuthActionCreators'

const initialState = {
  signupState: null,
  signupStatus: null,
  loginState: null,
  loginStatus: null,
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

  [actions.LOGIN_REQUEST]: (state) =>
    mergeImmutable(state, {
      loginState: 'loading',
      loginStatus: null,
    }),

  [actions.LOGIN_RECEIVE]: (state, action) =>
    mergeImmutable(state, {
      loginState: 'done',
      loginStatus: action.loginStatus,
    }),

  [actions.LOGIN_FAILED]: (state) =>
    mergeImmutable(state, {
      loginState: 'failed',
      loginStatus: null,
    }),
}

export default (reducer) =>
  (state = initialState, action) =>
    reducer(handlers, state, action)
