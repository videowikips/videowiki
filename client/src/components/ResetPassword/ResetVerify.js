import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Form, Message } from 'semantic-ui-react'
import validator from 'validator'

import StateRenderer from '../common/StateRenderer'

import actions from '../../actions/AuthActionCreators'

class ResetVerify extends Component {
  constructor (props) {
    super(props)

    this.state = {
      password: '',
    }

    this._updatePassword = this._updatePassword.bind(this)
    this._handleMessageDismiss = this._handleMessageDismiss.bind(this)
  }

  componentWillMount () {
    const { dispatch, match } = this.props
    const { email, token } = match.params
    dispatch(actions.verifyResetToken({ email, token }))
  }

  _updatePassword (e, { value }) {
    this.setState({ password: value })
  }

  _handleMessageDismiss () {
    this.props.dispatch(actions.resetPasswordStatus())
  }

  _renderError () {
    const { updatePasswordStatus } = this.props
    return updatePasswordStatus ? (
      <Message size="small" onDismiss={this._handleMessageDismiss}>{ updatePasswordStatus }</Message>
    ) : null
  }

  _isFormValid () {
    const { password } = this.state
    const { isEmpty } = validator

    return !isEmpty(password)
  }

  _handleUpdatePassword (e) {
    e.preventDefault()
    const { password } = this.state
    const email = this.props.match.params.email
    this.props.dispatch(actions.updatePassword({ password, email }))
  }

  _render () {
    const { password } = this.state
    return (
      <div className="s-signup-form__reset u-center">
        <Form className="c-signup-form u-block-center">
          { this._renderError() }
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
            disabled={!this._isFormValid()}
            onClick={(e) => this._handleUpdatePassword(e)}
          >
            Update Password
          </Form.Button>
        </Form>
      </div>
    )
  }

  render () {
    const { verifyResetTokenState, verifyResetTokenError } = this.props
    let errorMessage = ''

    if (verifyResetTokenState === 'failed') {
      errorMessage = verifyResetTokenError.response.text
    }

    return (
      <StateRenderer
        componentState={ verifyResetTokenState }
        loaderMessage="Verifying..."
        errorMessage={ errorMessage }
        onRender={() => this._render()}
      />
    )
  }
}

ResetVerify.propTypes = {
  dispatch: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
  verifyResetTokenState: PropTypes.string.isRequired,
  verifyResetTokenError: PropTypes.object,
  resetPasswordError: PropTypes.object,
  updatePasswordStatus: PropTypes.string,
}

const mapStateToProps = (state) =>
  Object.assign({}, state.auth)
export default connect(mapStateToProps)(ResetVerify)
