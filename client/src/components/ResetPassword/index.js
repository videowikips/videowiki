import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { Form, Message } from 'semantic-ui-react'
import validator from 'validator'

import LoaderOverlay from '../common/LoaderOverlay'

import actions from '../../actions/AuthActionCreators'

class ResetPassword extends Component {
  constructor (props) {
    super(props)

    this.state = {
      email: '',
    }

    this._updateEmail = this._updateEmail.bind(this)
    this._handleResetSubmit = this._handleResetSubmit.bind(this)
  }

  _handleResetSubmit (e) {
    e.preventDefault()

    const { email } = this.state
    this.props.dispatch(actions.resetPassword({ email }))
  }

  _updateEmail (e, { value }) {
    this.setState({ email: value })
  }

  _isFormValid () {
    const { email } = this.state
    const { isEmail, isEmpty } = validator
    return !isEmpty(email) && isEmail(email)
  }

  _renderError (isFailed) {
    return isFailed ? (
      <Message color="red" size="small">Error while restting your password. Please try again later!</Message>
    ) : null
  }

  _render ({ isFailed }) {
    const { email } = this.state

    return (
      <div className="u-center">
        <Form className="c-signup-form u-block-center">
          <label>Enter the email address associated with your account and we'll email you a link to reset your password.</label>
          { this._renderError(isFailed) }
          <Form.Input
            placeholder="Email"
            type="email"
            icon="envelope"
            iconPosition="right"
            onChange={this._updateEmail}
            value={email}
          />

          <Form.Button
            primary
            disabled={!this._isFormValid()}
            onClick={(e) => this._handleResetSubmit(e)}
          >
            Send Reset Link
          </Form.Button>
        </Form>
      </div>
    )
  }

  _renderHome () {
    return (
      <Redirect to="/reset/notify" />
    )
  }

  render () {
    const { resetState } = this.props

    switch (resetState) {
      case 'done':
        return this._renderHome()
      case 'loading':
        return (
          <LoaderOverlay></LoaderOverlay>
        )
      case 'failed':
        return this._render({ isFailed: true })
      default:
        return this._render({ isFailed: false })
    }
  }
}

ResetPassword.propTypes = {
  dispatch: PropTypes.func.isRequired,
  resetState: PropTypes.string,
}

const mapStateToProps = (state) =>
  Object.assign({}, state.auth)
export default connect(mapStateToProps)(ResetPassword)
