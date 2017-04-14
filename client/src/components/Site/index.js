import React, { Component, PropTypes } from 'react'
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'

import Header from '../Header'
import Footer from '../Footer'

export default class Site extends Component {
  render () {
    return (
      <div>
        <Header />
        {React.cloneElement(this.props.children)}
        <Footer />
      </div>
    )
  }
}

Site.propTypes = {
  children: PropTypes.object,
}
