import React, { Component } from 'react'
import { Search } from 'semantic-ui-react'

import Logo from './Logo'
import AuthButtons from './AuthButtons'

export default class Header extends Component {
  render () {
    return (
      <div className="c-header">
        <Logo className="c-header__logo" />

        <Search className="c-search-bar"/>

        <AuthButtons />
      </div>
    )
  }
}
