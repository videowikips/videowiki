import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

import { store, persistor } from './store'
import AppRouter from './AppRouter'

import './stylesheets/main.scss'
import '../../node_modules/semantic-ui-css/semantic.min.css'
import 'basscss/css/basscss.min.css'

ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <AppRouter />
    </PersistGate>
  </Provider>,
  document.getElementById('app'),
)
