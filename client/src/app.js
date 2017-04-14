import React from 'react'
import ReactDOM from 'react-dom'

import AppRouter from './AppRouter'

require('./stylesheets/main.scss')
import '../../node_modules/semantic-ui-css/semantic.min.css'

ReactDOM.render(
  <AppRouter />,
  document.getElementById('app'),
)
