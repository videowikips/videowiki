import React from 'react'
import ReactDOM from 'react-dom'

import Home from './components/pages/Home'

require('./stylesheets/main.scss')

ReactDOM.render(
  <Home/>,
  document.getElementById('app'),
)
