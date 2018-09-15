import React from 'react'
import { Button } from 'semantic-ui-react'

const Login = () => (
  <div className="s-login-form u-center">
    <h2>VideoWiki is made by people like you</h2>
    <Button primary href="auth/wiki">
      Login using Mediawiki
        </Button>
  </div>
)

export default Login
