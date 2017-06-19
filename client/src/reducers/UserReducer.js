import { mergeImmutable } from '../utils'
import actions from '../actions/UserActionCreators'

const initialState = {
  fetchLeaderboardState: 'loading',
  leaderboard: null,
}

const handlers = {
  [actions.FETCH_LEADERBOARD_REQUEST]: (state) =>
    mergeImmutable(state, {
      fetchLeaderboardState: 'loading',
      leaderboard: null,
    }),

  [actions.FETCH_LEADERBOARD_RECEIVE]: (state, action) =>
    mergeImmutable(state, {
      fetchLeaderboardState: 'done',
      leaderboard: action.leaderboard,
    }),

  [actions.FETCH_LEADERBOARD_FAILED]: (state) =>
    mergeImmutable(state, {
      fetchLeaderboardState: 'failed',
      leaderboard: null,
    }),
}

export default (reducer) =>
  (state = initialState, action) =>
    reducer(handlers, state, action)
