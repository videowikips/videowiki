import React, { Component } from 'react'
import { connect } from 'react-redux';
import { Button } from 'semantic-ui-react'
import PopupTools from 'popup-tools'
import { NotificationManager } from 'react-notifications';
import authActions from '../../actions/AuthActionCreators'
class AuthButtons extends Component {

  onLogin() {
    PopupTools.popup('/auth/wiki', 'Wiki Connect', { width: 1000, height: 600 }, (err, data) => {
      if (!err) {
        this.props.dispatch(authActions.validateSession());
        NotificationManager.success('Awesome! You can now upload files to VideoWiki directly from your computer.');

        if (this.props.onAuth) {
          this.props.onAuth()
        }
      }
    })
  }

  render() {
    const { containerStyles, ...rest } = this.props;
    console.log('container styles', containerStyles, this.props.noMargen)
    return (
      <div className={this.props.noMargen ? '' : 'c-auth-buttons'}>
        <Button
          {...rest}
          primary
          className="c-auth-buttons__signup"
          onClick={this.onLogin.bind(this)}
        >
          Register / Login with Wikipedia
        </Button>
      </div>
    )
  }
}

export default connect()(AuthButtons);
