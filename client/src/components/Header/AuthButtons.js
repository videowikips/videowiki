import React, { Component } from 'react'
import { Button } from 'semantic-ui-react'

export default class AuthButtons extends Component {
  render () {
    return (
      <div className="c-auth-buttons">
        <Button
          primary
          className="c-auth-buttons__signup"
          href="/signup"
        >
          Sign Up
        </Button>
        <Button
          basic
          className="c-auth-buttons__login"
          href="/login"
        >
          Login
        </Button>
      </div>
    )
  }
}
