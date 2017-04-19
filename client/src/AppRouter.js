import React from 'react'
import {
  BrowserRouter as Router,
  Route,
  Switch,
} from 'react-router-dom'

import Site from './components/Site'
import Home from './components/Home'
import Signup from './components/Signup'
import SiteNotFound from './components/SiteNotFound'
import Page from './components/Page'

const AppRouter = () => (
  <Router>
    <Site>
      <Switch>
        <Route exact path="/" component={Home}/>
        <Route path="/signup" component={Signup}/>
        <Route path="/login" component={SiteNotFound}/>
        <Route path="/wiki/:title" component={Page}/>
      </Switch>
    </Site>
  </Router>
)

export default AppRouter
