import React, { PropTypes } from 'react'
import { Modal, Button } from 'semantic-ui-react'
import AuthButtons from '../Header/AuthButtons'

const AuthModal = (props) => (
  <Modal
    style={{
      marginTop: '15%',
      marginLeft: 'auto',
      marginRight: 'auto',
      textAlign: 'center',
      maxWidth: '500px',
    }}
    onClose={props.onClose}
    size="small"
    open={props.open}
  >
    <Modal.Content>
      <Modal.Description>
        <p>Only logged in users can upload files. </p>
        <p>A good Chance to Log In</p>
      </Modal.Description>
    </Modal.Content>
    <Modal.Actions>
      <Button onClick={props.onClose} >
        Cancel
      </Button>
      <div style={{ display: 'inline-block', marginBottom: '-2rem' }} >
        <AuthButtons containerStyles={{ marginBottom: '0px !important' }} />
      </div>
    </Modal.Actions>
  </Modal>
)

AuthModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.bool.isRequired,
}

export default AuthModal
