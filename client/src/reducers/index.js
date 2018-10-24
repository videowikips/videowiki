import { combineReducers } from 'redux'

import auth from './AuthReducer'
import wiki from './WikiReducer'
import article from './ArticleReducer'
import user from './UserReducer'
import ui from './UIReducer'

const reducer = (handlers, state, action) =>
  handlers[action.type] ? handlers[action.type](state, action) : state

export default function createRootReducer (additionalReducers = {}) {
  const reducers = {
    auth: auth(reducer),
    wiki: wiki(reducer),
    article: article(reducer),
    user: user(reducer),
    ui: ui(reducer),
  }

  return combineReducers(Object.assign({}, additionalReducers, reducers))
}
