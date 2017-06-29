import React, { Component, PropTypes } from 'react'
import { withRouter } from 'react-router-dom'
import { Dropdown, Image } from 'semantic-ui-react'

class UserProfileDropdown extends Component {
  constructor (props) {
    super(props)

    this.state = {
      value: null,
    }

    this._handleOptionSelect = this._handleOptionSelect.bind(this)
  }

  _handleOptionSelect (e) {
    const selection = e.target.getAttribute('name')

    if (selection === 'signout' || e.target.innerText === 'Sign Out') {
      this.props.history.push('/logout')
    }
  }

  _getUserNameNode () {
    const { user } = this.props
    const { firstName, lastName } = user

    const name = `${firstName} ${lastName}`

    return (
      <span>
        <Image avatar src="/img/avatar.png" /> { name }
      </span>
    )
  }

  render () {
    let articlesEditCount = 0
    let articlesEdited = []
    let totalEditCount = 0

    if (this.props.user) {
      articlesEdited = this.props.user.articlesEdited
      totalEditCount = this.props.user.totalEdits
    }

    if (articlesEdited) {
      articlesEditCount = articlesEdited.length
    } else {
      articlesEditCount = 0
    }

    const options = [
      { key: 'edited', text: `Articles Edited - ${articlesEditCount}`, name: 'edited' },
      { key: 'total', text: `Total Edits - ${totalEditCount}`, name: 'total' },
      { key: 'sign-out', text: 'Sign Out', icon: 'sign out', name: 'signout' },
    ]
    return (
      <Dropdown
        trigger={this._getUserNameNode()}
        options={options}
        pointing="top right"
        icon={null}
        onChange={this._handleOptionSelect}
      />
    )
  }
}

UserProfileDropdown.propTypes = {
  user: PropTypes.object.isRequired,
  history: React.PropTypes.shape({
    push: React.PropTypes.func.isRequired,
  }).isRequired,
}

export default withRouter(UserProfileDropdown)
