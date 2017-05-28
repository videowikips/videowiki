import React, { Component, PropTypes } from 'react'
import { withRouter } from 'react-router-dom'
import { Dropdown, Image } from 'semantic-ui-react'

const options = [
  { key: 'edited', text: 'Articles Edited - 5', name: 'edited' },
  { key: 'total', text: 'Total Edits - 10', name: 'total' },
  { key: 'sign-out', text: 'Sign Out', icon: 'sign out', name: 'signout' },
]

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
        <Image avatar src="/img/default_profile.png" /> { name }
      </span>
    )
  }

  render () {
    return (
      <Dropdown
        trigger={this._getUserNameNode()}
        options={options}
        pointing="top left"
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
