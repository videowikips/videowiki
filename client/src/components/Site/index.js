import React, { Component, PropTypes } from 'react'

import Header from '../Header'
import Footer from '../Footer'

export default class Site extends Component {
  render () {
    return (
      <div className="c-app">
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
