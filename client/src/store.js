import { createStore, applyMiddleware, compose } from 'redux'
import { createLogger } from 'redux-logger'
import reduxThunk from 'redux-thunk'

const middlewares = localStorage.getItem('redux-logger')
  ? applyMiddleware(reduxThunk, createLogger())
  : applyMiddleware(reduxThunk)

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

export default (rootReducer, initialState) =>
  createStore(
    rootReducer,
    initialState,
    composeEnhancers(middlewares),
  )
