import React, { PropTypes } from 'react';
import { TextArea, Button } from 'semantic-ui-react';

class TranslateBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value) {
      this.setState({ value: nextProps.value });
    }
  }

  render() {
    const { loading } = this.props;
    const { value } = this.state;

    return (
      <div className="c-export-human-voice__translate_box">
        <TextArea
          style={{ padding: 20, width: '100%' }}
          rows={5}
          placeholder="Translate slide text"
          value={value}
          onChange={(e, { value }) => this.setState({ value })}
        />
        <Button
          primary
          title="Click here after translating the text and recording the audio to the slide"
          loading={loading}
          disabled={loading || value.trim() === this.props.value.trim()}
          onClick={() => this.props.onSave(value)}
        >Save</Button>
      </div>
    )
  }
}

TranslateBox.propTypes = {
  value: PropTypes.string,
  loading: PropTypes.bool,
  saveDisabled: PropTypes.bool,
  onSave: PropTypes.func,
}

TranslateBox.defaultProps = {
  value: '',
  saveDisabled: false,
  looading: false,
  onSave: () => {},
}

export default TranslateBox;
