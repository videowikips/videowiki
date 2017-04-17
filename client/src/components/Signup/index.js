import React, { Component } from 'react'
import { connect } from 'react-redux'

import { Form } from 'semantic-ui-react'

class Signup extends Component {
  constructor (props) {
    super(props)
    this.state = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    }

    this._updateFirstname = this._updateFirstname.bind(this)
    this._updateLastname = this._updateLastname.bind(this)
    this._updateEmail = this._updateEmail.bind(this)
    this._updatePassword = this._updatePassword.bind(this)
  }

  _updateFirstname (e, { value }) {
    this.setState({ firstName: value })
  }

  _updateLastname (e, { value }) {
    this.setState({ lastName: value })
  }

  _updateEmail (e, { value }) {
    this.setState({ email: value })
  }

  _updatePassword (e, { value }) {
    this.setState({ password: value })
  }

  _handleSignup (e) {
    e.preventDefault()
    console.log(this.state)
  }

  render () {
    console.log(this.props)
    const { firstName, lastName, email, password } = this.state

    return (
      <div className="s-signup-form u-center">
        <h2>VideoWiki is made by people like you</h2>
        <Form className="c-signup-form u-block-center">
          <Form.Group widths="equal">
            <Form.Input
              placeholder="First name"
              onChange={this._updateFirstname}
              value={firstName}
            />
            <Form.Input
              placeholder="Last name"
              onChange={this._updateLastname}
              value={lastName}
            />
          </Form.Group>
          <Form.Input
            placeholder="Email"
            type="email"
            icon="envelope"
            iconPosition="right"
            onChange={this._updateEmail}
            value={email}
          />
          <Form.Input
            placeholder="Password"
            type="password"
            icon="lock"
            iconPosition="right"
            onChange={this._updatePassword}
            value={password}
          />
          <Form.Button
            primary
            onClick={(e) => this._handleSignup(e)}
          >
            Create Account
          </Form.Button>
        </Form>
      </div>
    )
  }
}

const mapStateToProps = (state) =>
  Object.assign({}, state.auth)
export default connect(mapStateToProps)(Signup)
