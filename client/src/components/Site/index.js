import React, { Component, PropTypes } from 'react'
import {
  Route,
  Switch,
} from 'react-router-dom'

import Home from '../Home'
import Signup from '../Signup'
import SiteNotFound from '../SiteNotFound'
import Page from '../Page'
import Editor from '../Editor'
import Header from '../Header'
import Footer from '../Footer'

export default class Site extends Component {
  render () {
    const { match } = this.props

    return (
      <div className="c-app">
        <Header match={ match } />
        <div className="c-app__main">
          <Switch>
            <Route exact path="/" component={Home}/>
            <Route path="/signup" component={Signup}/>
            <Route path="/login" component={SiteNotFound}/>
            <Route path="/wiki/:title" component={Page}/>
            <Route path="/editor" component={Editor}/>
          </Switch>
        </div>
        <Footer />
      </div>
    )
  }
}

Site.propTypes = {
  match: PropTypes.object,
}
