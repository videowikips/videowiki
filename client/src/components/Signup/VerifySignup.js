import React, { Component } from 'react'
import { Icon } from 'semantic-ui-react'

export default class VerifySignup extends Component {
  render () {
    return (
      <div className="u-center">
        <Icon circular color="green" name="check" inverted size="big"/>
        <br/>
        <br/>
        <p>A verification mail has been sent to your email id.</p>
        <p>Check your spam folder if you didn't receive the mail in your inbox.</p>
        <p>You are one of the earliest members of the VideoWiki Community.</p>
      </div>
    )
  }
}
