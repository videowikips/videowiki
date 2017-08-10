import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router-dom'

const logo = '/img/logo.png'

export default class Logo extends Component {
  _renderLogoSubText () {
    const { match } = this.props
    return match.isExact ? (
      <p id="logoText">The Free Multi-Media Encyclopedia that anyone can edit.</p>
    ) : null
  }

  render () {
    return (
      <Link to="/" className="c-logo-wrapper u-center">
        <div className="c-logo">
          <img className="c-logo__img" src={logo}/>
        </div>
        {this._renderLogoSubText()}
      </Link>
    )
  }
}

Logo.propTypes = {
  match: PropTypes.object.isRequired,
}
