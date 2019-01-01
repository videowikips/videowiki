import React, { PropTypes } from 'react'
import { Modal, Icon } from 'semantic-ui-react'
import AuthButtons from '../Header/AuthButtons'

const AuthModal = (props) => (
  <Modal
    style={{
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
        <Icon name="close" />
      </a>
    </Modal.Header>
    <Modal.Content style={{ paddingTop: 0 }} >
      <Modal.Description>
        <p>{props.heading}</p>
        <p>A good chance to Log In</p>
      </Modal.Description>
    </Modal.Content>
    <AuthButtons fluid onAuth={props.onClose} noMargen style={{ height: 50, borderRadius: 0 }} />
  </Modal >
)

AuthModal.defaultProps = {
  heading: 'Only logged in users can upload files.',
}

AuthModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  heading: PropTypes.string,
}

export default AuthModal
