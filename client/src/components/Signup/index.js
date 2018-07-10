import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Form, Loader, Dimmer, Icon, Message } from 'semantic-ui-react'
import validator from 'validator'
import { Redirect } from 'react-router-dom'
import ReCAPTCHA from 'react-google-recaptcha'

import LoaderOverlay from '../common/LoaderOverlay'

import actions from '../../actions/AuthActionCreators'

class Signup extends Component {
  constructor (props) {
    super(props)
    this.state = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      renderSignup: true,
      captcha: '',
    }

    this._updateFirstname = this._updateFirstname.bind(this)
    this._updateLastname = this._updateLastname.bind(this)
    this._updateEmail = this._updateEmail.bind(this)
    this._updatePassword = this._updatePassword.bind(this)
    this._updateCaptcha = this._updateCaptcha.bind(this)

    this._handleMessageDismiss = this._handleMessageDismiss.bind(this)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.signupState === 'loading' && nextProps.signupState === 'done') {
      // signup successful!
      this.setState({
        renderSignup: false,
      })
    }
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

  _updateCaptcha (value) {
    this.setState({ captcha: value })
  }

  _handleSignup (e) {
    e.preventDefault()
    this.props.dispatch(actions.signup(this.state))
  }

  _isFormValid () {
    const { firstName, lastName, email, password } = this.state
    const { isEmail, isEmpty } = validator

    return !isEmpty(firstName) && !isEmpty(lastName) &&
      !isEmpty(email) && !isEmpty(password) &&
      isEmail(email)
  }

  _renderLoading () {
    return this.props.signupState === 'loading' ? (
      <Dimmer active inverted>
        <Loader size="large" active inverted>Hold tight! Loading wiki content...</Loader>
      </Dimmer>
    ) : null
  }

  _handleMessageDismiss () {
    this.props.dispatch(actions.resetSignupError())
  }

  _renderError () {
    const { signupError } = this.props
    return signupError && signupError.response ? (
      <Message color="red" size="small" onDismiss={this._handleMessageDismiss}>{ signupError.response.text }</Message>
    ) : null
  }

  _renderSignupForm () {
    const { firstName, lastName, email, password } = this.state
    return (
      <div className="s-signup-form u-center">
        <h2>VideoWiki is made by people like you</h2>
        <Form className="c-signup-form u-block-center">
          { this._renderError() }
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
          <ReCAPTCHA
            ref="recaptcha"
            sitekey="6LeCTmMUAAAAAKOszeOuSRUZR2ZrCy0XikHyTRIp"
            onChange={this._updateCaptcha}
          />
          <Form.Button
            primary
            disabled={!this._isFormValid()}
            onClick={(e) => this._handleSignup(e)}
          >
            Create Account
          </Form.Button>
        </Form>
      </div>
    )
  }

  _renderVerificationMessage () {
    return (
      <div className="u-center">
        <Icon circular color="green" name="check" inverted size="big"/>
        <br/>
        <br/>
        <p>A verification mail has been sent to your email id.</p>
        <p>Check your spam folder if you didn't receive the mail in your inbox.</p>
      </div>
    )
  }

  _renderVerificationScreen () {
    return (
      <Redirect to="/signup/verify"/>
    )
  }

  render () {
    const { signupState } = this.props

    switch (signupState) {
      case 'done':
        return this._renderVerificationScreen()
      case 'loading':
        return (
          <LoaderOverlay></LoaderOverlay>
        )
      case 'failed':
        return this._renderSignupForm()
      default:
        return this._renderSignupForm()
    }
  }
}

const mapStateToProps = (state) =>
  Object.assign({}, state.auth)
export default connect(mapStateToProps)(Signup)

Signup.propTypes = {
  dispatch: PropTypes.func.isRequired,
  signupState: PropTypes.string,
  signupError: PropTypes.object,
}
