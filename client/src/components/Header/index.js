import React, { Component, PropTypes } from 'react'
import WikiSearch from './WikiSearch'

import Logo from './Logo'
import AuthButtons from './AuthButtons'

export default class Header extends Component {
  _renderUser () {
    return this.props.session ? (
      <div>{ this.props.session.user.firstName }</div>
    ) : <AuthButtons />
  }

  render () {
    return (
      <header className="c-app__header">
        <Logo className="c-app__header__logo" match={this.props.match} />
        <WikiSearch />
        { this._renderUser() }
      </header>
    )
  }
}

Header.propTypes = {
  match: PropTypes.object.isRequired,
  session: PropTypes.object,
}
