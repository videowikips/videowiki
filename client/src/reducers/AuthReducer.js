import actions from '../actions/AuthActionCreators'

const initialState = {
  signupState: 'loading',
  signupStatus: null,
}

const handlers = {
  [actions.SIGNUP_REQUEST]: (state) =>
    Object.assign(state, {
      signupState: 'loading',
    }),

  [actions.SIGNUP_RECEIVE]: (state, action) =>
    Object.assign(state, {
      signupState: 'done',
      signupStatus: action.signupStatus,
    }),

  [actions.SIGNUP_FAILED]: (state, action) =>
    Object.assign(state, {
      signupState: 'failed',
      signupStatus: action.signupStatus,
    }),
}

export default (reducer) =>
  (state = initialState, action) =>
    reducer(handlers, state, action)
