import React, { PropTypes } from 'react';
import { Modal, ModalContent, ModalActions, Button } from 'semantic-ui-react';

class InvalidPublishModal extends React.Component {
  render() {
    return (
      <Modal size="tiny" open={this.props.open} onClose={this.props.onClose} style={{ textAlign: 'center' }} >
        <ModalContent>
          <h3>Add voice over and translated text to ALL the slides</h3>
        </ModalContent>
        <ModalActions style={{ padding: 0 }}>
          <Button style={{ margin: 0, borderRadius: 0 }} fluid primary onClick={this.props.onClose}>Got it</Button>
        </ModalActions>
      </Modal>
    )
  }
}

InvalidPublishModal.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
}

InvalidPublishModal.defaultProps = {
  onClose: () => {},
  open: false,
}

export default InvalidPublishModal;
