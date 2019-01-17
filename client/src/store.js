import { createStore, applyMiddleware, compose } from 'redux'
import { createLogger } from 'redux-logger'
import reduxThunk from 'redux-thunk'
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import createRootReducer from './reducers'

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['ui'],
}

const middlewares = localStorage.getItem('redux-logger')
  ? applyMiddleware(reduxThunk, createLogger())
  : applyMiddleware(reduxThunk)

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

function configureStore(rootReducer, initialState) {
  const persistedReducer = persistReducer(persistConfig, rootReducer)

  const store = createStore(
    persistReducer(persistConfig, persistedReducer),
    initialState,
    composeEnhancers(middlewares),
  )
  const persistor = persistStore(store)

  return { store, persistor }
}

const rootReducer = createRootReducer()
const { store, persistor } = configureStore(rootReducer)

export {
  store,
  persistor,
}
