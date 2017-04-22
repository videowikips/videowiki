import React, { Component, PropTypes } from 'react'

import Header from '../Header'
import Footer from '../Footer'

export default class Site extends Component {
  render () {
    return (
      <div className="c-app">
        <Header />
        <div className="c-app__main">
          {React.cloneElement(this.props.children)}
        </div>
        <Footer />
      </div>
    )
  }
}

Site.propTypes = {
  children: PropTypes.object,
}
