import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Button } from 'semantic-ui-react'

export default class AuthButtons extends Component {
  render () {
    return (
      <div className="c-auth-buttons">
        <Button
          primary
          className="c-auth-buttons__signup"
          href="/login"
        >
          <Link to="/login" style={{ color: 'white' }}>Sign Up/Login</Link>
        </Button>
      </div>
    )
  }
}
