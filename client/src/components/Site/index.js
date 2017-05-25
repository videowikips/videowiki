import React, { Component, PropTypes } from 'react'
import {
  Route,
  Switch,
} from 'react-router-dom'

import Home from '../Home'
import VerifySignup from '../Signup/VerifySignup'
import Signup from '../Signup'
import Login from '../Login'
import Page from '../Page'
import Editor from '../Editor'
import Header from '../Header'
// import Footer from '../Footer'
import WikiProgress from '../Wiki/WikiProgress'
import SiteNotFound from '../SiteNotFound'

export default class Site extends Component {
  render () {
    const { match } = this.props

    return (
      <div className="c-app">
        <Header match={ match } />
        <div className="c-app__main">
          <Switch>
            <Route exact path="/" component={Home}/>
            <Route path="/signup/verify" component={VerifySignup}/>
            <Route path="/signup" component={Signup}/>
            <Route path="/login" component={Login}/>
            <Route path="/wiki/convert/:title" component={WikiProgress}/>
            <Route path="/wiki/:title" component={Page}/>
            <Route path="/editor/:title" component={Editor}/>
            <Route component={SiteNotFound}/>
          </Switch>
        </div>
        {/* <Footer /> */}
      </div>
    )
  }
}

Site.propTypes = {
  match: PropTypes.object,
}
