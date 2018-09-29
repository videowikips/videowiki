import React, { PropTypes } from 'react'
import { Modal, Popup, Icon } from 'semantic-ui-react'
import AuthButtons from '../Header/AuthButtons'

const AuthModal = (props) => (
  <Modal
    style={{
      marginTop: '15%',
      marginLeft: 'auto',
      marginRight: 'auto',
      textAlign: 'center',
      maxWidth: '350px',
    }}
    onClose={props.onClose}
    size="small"
    open={props.open}
  >

    <Modal.Header style={{ borderBottom: 0 }} >
      <a
        style={{
          position: 'absolute',
          color: 'black',
          top: 5,
          right: 5,
          fontSize: '1rem',
        }}
        href="javascript:void(0)"
        onClick={props.onClose}
      >
        <Icon name="close circle" />
      </a>
    </Modal.Header>
    <Modal.Content style={{ paddingTop: 0 }} >
      <Modal.Description>
        <p>Only logged in users can upload files. </p>
        <p>A good Chance to Log In</p>
      </Modal.Description>
    </Modal.Content>
    <AuthButtons fluid style={{ height: 50, borderRadius: 0 }} />
  </Modal >
)

AuthModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.bool.isRequired,
}

export default AuthModal
