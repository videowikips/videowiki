import React, { Component } from 'react'
import { Search } from 'semantic-ui-react'

import Logo from './Logo'
import AuthButtons from './AuthButtons'

export default class Header extends Component {
  render () {
    return (
      <header className="c-app__header">
        <Logo className="c-app__header__logo" />

        <Search className="c-search-bar"/>

        <AuthButtons />
      </header>
    )
  }
}
