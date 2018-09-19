import React, { Component } from 'react'
import { Button } from 'semantic-ui-react'
import PopupTools from 'popup-tools'

export default class AuthButtons extends Component {

  onLogin () {
    PopupTools.popup('/auth/wiki', 'Wiki Connect', { width: 1000, height: 600 }, (err, data) => {
      if (!err) {
        location.reload()
      }
    })
  }

  render () {
    return (
      <div className="c-auth-buttons">
        <Button
          primary
          className="c-auth-buttons__signup"
          onClick={this.onLogin}
        >
          Register / Login with Wikipedia
        </Button>
      </div>
    )
  }
}
