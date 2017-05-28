import React, { Component, PropTypes } from 'react'

import WikiSearch from './WikiSearch'
import Logo from './Logo'
import AuthButtons from './AuthButtons'
import UserProfileDropdown from './UserProfileDropdown'

export default class Header extends Component {
  _renderUser () {
    const { session } = this.props
    return session ? (
      <UserProfileDropdown user={ session.user } />
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
