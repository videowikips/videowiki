import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { NotificationManager } from 'react-notifications';
import StateRenderer from '../common/StateRenderer'

import actions from '../../actions/AuthActionCreators'

class Logout extends Component {
  componentWillMount () {
    this.props.dispatch(actions.logout())
  }

  _render () {
    NotificationManager.success('Success', 'Logged out successfully')
    return (
      <Redirect to="/" />
    )
  }

  render () {
    const { logoutState } = this.props

    return (
      <StateRenderer
        componentState={logoutState}
        loaderMessage="Signing you out..."
        errorMessage="Error while signing you out! Please try again!"
        onRender={() => this._render()}
      />
    )
  }
}

const mapStateToProps = (state) =>
  Object.assign({}, state.auth)
export default connect(mapStateToProps)(Logout)


Logout.propTypes = {
  dispatch: PropTypes.func.isRequired,
  logoutState: PropTypes.string,
}
