import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router-dom'

const logo = '/img/logo.png'

export default class Logo extends Component {
  render () {
    return (
      <Link to="/" className="c-logo-wrapper u-center">
        <div>
          <div className="c-logo">
           <img className="c-logo__img" src={logo}/>
          </div>
          <p id="logoText"><b>The Free Multi-Media Encyclopedia that anyone can edit.</b></p>
        </div>
      </Link>
    )
  }
}

Logo.propTypes = {
  match: PropTypes.object.isRequired,
}
