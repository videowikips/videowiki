import React, {
  PropTypes,
} from 'react';
import { Modal, ModalContent, ModalActions, Button, Dropdown, Input } from 'semantic-ui-react';
import _ from 'lodash';
import { isoLangsArray, isoLangs } from '../../../utils/langs'
const languagesOptions = isoLangsArray.map((lang) => ({ key: lang.code, value: lang.code, text: `${lang.name}` }));

class AddHumanVoiceModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      language: 'en',
      dropdownOptions: languagesOptions.slice(),
      searchValue: '',
    }
  }

  onInputClick(e) {
    e.preventDefault()
    e.stopPropagation()
  }

  onChange(e) {
    const searchQuery = e.target.value
    if (searchQuery === '') {
      this.setState({ dropdownOptions: languagesOptions, searchValue: '' })
      return;
    }
    const r = _.filter(languagesOptions, (o) => _.startsWith(_.lowerCase(o.text), _.lowerCase(searchQuery)));
    this.setState({ dropdownOptions: r, searchValue: searchQuery });
  }

  render() {
    return (
      <Modal size="tiny" open={this.props.open} className="c-add-human-voice-modal" onClose={this.props.onClose}>
        <ModalContent className="c-add-human-voice-modal__content" >
          <h3>Add Human Voice Over In:</h3>
          {/* <Dropdown
            placeholder="Select language"
            search
            selection
            fluid
            options={languagesOptions}
            value={this.state.language}
            onChange={(e, { value }) => {
              this.setState({ language: value });
              e.stopPropagation();
            }}
          /> */}

          <Dropdown fluid text={`${isoLangs[this.state.language].name}`} className='icon' onChange={this.onChange.bind(this)} >
            <Dropdown.Menu style={{ width: '100%' }}>
              <Input icon="search" iconPosition="left" className="search" onClick={this.onInputClick.bind(this)} value={this.state.searchValue} />
              <Dropdown.Menu scrolling>
                {this.state.dropdownOptions.map((option) => <Dropdown.Item key={option.value} {...option} onClick={() => this.setState({ language: option.value, searchValue: '', dropdownOptions: languagesOptions })} />)}
              </Dropdown.Menu>
            </Dropdown.Menu>
          </Dropdown>
        </ModalContent>
        <ModalActions>
          {this.props.skippable ? (
            <Button onClick={() => this.props.onSkip()} >Skip</Button>
          ) : (
            <Button onClick={this.props.onClose}>Cancel</Button>
          )}
          <Button color="primary" onClick={() => this.props.onSubmit(this.state.language)} >Yes</Button>
        </ModalActions>
      </Modal>
    )
  }
}

AddHumanVoiceModal.defaultProps = {
  open: false,
  skippable: true,
  onClose: () => {},
  onSkip: () => {},
  onSubmit: () => {},
}

AddHumanVoiceModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSkip: PropTypes.func,
  onSubmit: PropTypes.func,
  skippable: PropTypes.bool,
}

export default AddHumanVoiceModal;
