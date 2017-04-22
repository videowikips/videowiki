import React, { Component, PropTypes } from 'react'
import WikiSearch from './WikiSearch'

import Logo from './Logo'
import AuthButtons from './AuthButtons'

export default class Header extends Component {
  render () {
    return (
      <header className="c-app__header">
        <Logo className="c-app__header__logo" match={this.props.match} />
        <WikiSearch />
        <AuthButtons />
      </header>
    )
  }
}

Header.propTypes = {
  match: PropTypes.object.isRequired,
}
