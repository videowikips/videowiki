import { createStore, applyMiddleware } from 'redux'
import createLogger from 'redux-logger'
import reduxThunk from 'redux-thunk'

const middlewares = localStorage.getItem('redux-logger')
  ? applyMiddleware(reduxThunk, createLogger())
  : applyMiddleware(reduxThunk)

export default (rootReducer, initialState) =>
  createStore(rootReducer, initialState, middlewares)
