import React from 'react'
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom'

import Site from './components/Site'

const AppRouter = () => (
  <Router>
    <Route path="/" component={Site} />
  </Router>
)

export default AppRouter
