import { combineReducers } from 'redux'

import auth from './AuthReducer'

const reducer = (handlers, state, action) =>
  handlers[action.type] ? handlers[action.type](state, action) : state

export default function createRootReduce () {
  const reducers = {
    auth: auth(reducer),
  }

  return combineReducers(Object.assign({}, reducers))
}
