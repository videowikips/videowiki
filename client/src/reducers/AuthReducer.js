import { mergeImmutable } from '../utils'
import actions from '../actions/AuthActionCreators'

const initialState = {
  signupState: null,
  signupStatus: null,
  signupError: null,
  loginState: null,
  loginStatus: null,
  loginError: null,
  session: null,
  logoutState: 'loading',
}

const handlers = {
  // ===========
  [actions.VALIDATE_SESSION_REQUEST]: (state) =>
    mergeImmutable(state, {
      session: null,
    }),

  [actions.VALIDATE_SESSION_RECEIVE]: (state, action) =>
    mergeImmutable(state, {
      session: action.session,
    }),

  [actions.VALIDATE_SESSION_FAILED]: (state) =>
    mergeImmutable(state, {
      session: null,
    }),


  // ===========
  [actions.SIGNUP_REQUEST]: (state) =>
    mergeImmutable(state, {
      signupState: 'loading',
      signupStatus: null,
      signupError: null,
    }),

  [actions.SIGNUP_RECEIVE]: (state, action) =>
    mergeImmutable(state, {
      signupState: 'done',
      signupStatus: action.signupStatus,
      signupError: null,
    }),

  [actions.SIGNUP_FAILED]: (state, action) =>
    mergeImmutable(state, {
      signupState: 'failed',
      signupStatus: null,
      signupError: action.reason,
    }),

  // ===========
  [actions.LOGIN_REQUEST]: (state) =>
    mergeImmutable(state, {
      loginState: 'loading',
      loginStatus: null,
      loginError: null,
    }),

  [actions.LOGIN_RECEIVE]: (state, action) =>
    mergeImmutable(state, {
      loginState: 'done',
      loginStatus: action.loginStatus,
      loginError: null,
      session: action.session,
    }),

  [actions.LOGIN_FAILED]: (state, action) =>
    mergeImmutable(state, {
      loginState: 'failed',
      loginStatus: null,
      loginError: action.reason,
    }),

  // ======== LOGOUT
  [actions.LOGOUT_REQUEST]: (state) =>
    mergeImmutable(state, {
      logoutState: 'loading',
    }),

  [actions.LOGOUT_RECEIVE]: (state) =>
    mergeImmutable(state, {
      logoutState: 'done',
      session: null,
    }),

  [actions.LOGOUT_FAILED]: (state) =>
    mergeImmutable(state, {
      logoutState: 'failed',
    }),

  // ===== RESET
  [actions.RESET_SIGNUP_ERROR]: (state) =>
    mergeImmutable(state, {
      signupError: null,
    }),

  [actions.RESET_LOGIN_ERROR]: (state) =>
    mergeImmutable(state, {
      loginError: null,
    }),
}

export default (reducer) =>
  (state = initialState, action) =>
    reducer(handlers, state, action)
