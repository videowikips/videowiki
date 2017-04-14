import React from 'react'
import {
  BrowserRouter as Router,
  Route,
  Switch,
} from 'react-router-dom'

import Site from './components/Site'
import Signup from './components/Signup'
import SiteNotFound from './components/SiteNotFound'

const AppRouter = () => (
  <Router>
    <Site>
      <Switch>
        <Route path="/signup" component={Signup}/>
        <Route path="/login" component={SiteNotFound}/>
      </Switch>
    </Site>
  </Router>
)

export default AppRouter
