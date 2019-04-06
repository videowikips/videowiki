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
  token: '',
  logoutState: 'loading',
  resetState: null,
  verifyResetTokenState: 'loading',
  verifyResetTokenError: null,
  updatePasswordState: 'loading',
  updatePasswordStatus: null,
}

const handlers = {
  // ===========
  // [actions.VALIDATE_SESSION_REQUEST]: (state) =>
  //   mergeImmutable(state, {
  //     session: null,
  //   }),

  [actions.VALIDATE_SESSION_RECEIVE]: (state, action) => {
    const update = {
      session: action.session,
    }
    if (action.session && action.session.token) {
      update['token'] = action.session.token;
    } else {
      update['token'] = null;
    }
    if (!action.session.user) {
      update.session.user = null;
    }
    if (!action.session.token) {
      update.session.token = null;
    }
    return mergeImmutable(state, update);
  },
  [actions.VALIDATE_SESSION_FAILED]: (state) =>
    mergeImmutable(state, {
      session: null,
      token: '',
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

  // ======
  [actions.RESET_PASSWORD_REQUEST]: (state) =>
    mergeImmutable(state, {
      resetState: 'loading',
    }),

  [actions.RESET_PASSWORD_RECEIVE]: (state) =>
    mergeImmutable(state, {
      resetState: 'done',
    }),

  [actions.RESET_PASSWORD_FAILED]: (state) =>
    mergeImmutable(state, {
      resetState: 'failed',
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

  [actions.RESET_PASSWORD_STATUS]: (state) =>
    mergeImmutable(state, {
      updatePasswordStatus: null,
    }),

  // ===== Verify reset token
  [actions.VERIFY_RESET_TOKEN_REQUEST]: (state) =>
    mergeImmutable(state, {
      verifyResetTokenState: 'loading',
    }),

  [actions.VERIFY_RESET_TOKEN_RECEIVE]: (state) =>
    mergeImmutable(state, {
      verifyResetTokenState: 'done',
    }),

  [actions.VERIFY_RESET_TOKEN_FAILED]: (state, action) =>
    mergeImmutable(state, {
      verifyResetTokenState: 'failed',
      verifyResetTokenError: action.reason,
    }),

  // ===== Update password
  [actions.UPDATE_PASSWORD_REQUEST]: (state) =>
    mergeImmutable(state, {
      updatePasswordState: 'loading',
    }),

  [actions.UPDATE_PASSWORD_RECEIVE]: (state, action) =>
    mergeImmutable(state, {
      updatePasswordState: 'done',
      updatePasswordStatus: action.updatePasswordStatus,
    }),

  [actions.UPDATE_PASSWORD_FAILED]: (state) =>
    mergeImmutable(state, {
      updatePasswordState: 'failed',
    }),
  [actions.SET_TOKEN]: (state, action) =>
    mergeImmutable(state, {
      token: action.token,
    }),
  [actions.SET_USER]: (state, action) =>
    mergeImmutable(state, {
      session: {
        user: action.user,
        token: action.user && state.token ? state.token : '',
      },
    }),
}

export default (reducer) =>
  (state = initialState, action) =>
    reducer(handlers, state, action)
