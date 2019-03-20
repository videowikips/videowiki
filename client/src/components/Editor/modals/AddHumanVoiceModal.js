import React, {
  PropTypes,
} from 'react';
import { Modal, ModalContent, ModalActions, Button, Dropdown } from 'semantic-ui-react';

const languagesOptions = [
  { key: 'en', value: 'en', text: 'English' },
  { key: 'hi', value: 'hi', text: 'Hindi' },
]

class AddHumanVoiceModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      language: 'en',
    }
  }

  render() {
    return (
      <Modal size="tiny" open={this.props.open} className="c-add-human-voice-modal" onClose={this.props.onClose}>
        <ModalContent className="c-add-human-voice-modal__content" >
          <h3>Add Human Voice Over In:</h3>
          <Dropdown
            placeholder="Select language"
            search
            selection
            fluid
            options={languagesOptions}
            value={this.state.language}
            onChange={(e, { value }) => this.setState({ language: value })}
          />
        </ModalContent>
        <ModalActions>
          <Button onClick={() => this.props.onSkip()} >Skip</Button>
          <Button color="primary" onClick={() => this.props.onSubmit(this.state.language)} >Yes</Button>
        </ModalActions>
      </Modal>
    )
  }
}

AddHumanVoiceModal.defaultProps = {
  open: false,
  onClose: () => {},
  onSkip: () => {},
  onSubmit: () => {},
}

AddHumanVoiceModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSkip: PropTypes.func,
  onSubmit: PropTypes.func,
}

export default AddHumanVoiceModal;
