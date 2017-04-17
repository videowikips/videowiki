import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'

import store from './store'
import AppRouter from './AppRouter'

import './stylesheets/main.scss'
import '../../node_modules/semantic-ui-css/semantic.min.css'

ReactDOM.render(
  <Provider store={store}>
    <AppRouter />
  </Provider>,
  document.getElementById('app'),
)
