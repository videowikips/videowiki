import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'

import configureStore from './store'
import createRootReducer from './reducers'
import AppRouter from './AppRouter'

import './stylesheets/main.scss'
import '../../node_modules/semantic-ui-css/semantic.min.css'

const rootReducer = createRootReducer()
const store = configureStore(rootReducer)

ReactDOM.render(
  <Provider store={store}>
    <AppRouter />
  </Provider>,
  document.getElementById('app'),
)
