import { createStore, applyMiddleware } from 'redux'
import createLogger from 'redux-logger'
import reduxThunk from 'redux-thunk'

import createRootReducer from './reducers'

const middlewares = localStorage.getItem('redux-logger')
  ? applyMiddleware(reduxThunk, createLogger())
  : applyMiddleware(reduxThunk)

const store = createStore(createRootReducer(), middlewares)

export default store
