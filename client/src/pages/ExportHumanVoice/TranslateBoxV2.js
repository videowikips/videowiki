import React from 'react';
import PropTypes from 'prop-types';
import { TextArea, Button, Popup, Card } from 'semantic-ui-react';
import { debounce } from '../../utils/helpers';

class TranslateBoxV2 extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
    }
    this.saveValue = debounce((value, currentSlideIndex, currentSubslideIndex) => {
      this.props.onSave(value, currentSlideIndex, currentSubslideIndex)
    }, 2000)
  }

  componentDidMount() {
    if (this.state.value !== this.props.value) {
      this.setState({ value: this.props.value });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value) {
      if ((this.props.currentSlideIndex !== nextProps.currentSlideIndex || this.props.currentSubslideIndex !== nextProps.currentSubslideIndex) && this.props.value !== this.state.value) {
        this.props.onSave(this.state.value, this.props.currentSlideIndex, this.props.currentSubslideIndex);
      }
      this.setState({ value: nextProps.value });
    }
  }

  onValueChange = (value, currentSlideIndex, currentSubslideIndex) => {
    this.setState({ value })
    // this.saveValue(value, currentSlideIndex, currentSubslideIndex);
  }

  render() {
    const { loading } = this.props;
    const { value } = this.state;

    return (
      <Card style={{ margin: 0, width: '100%', borderRadius: 0 }}>
        <Card.Header style={{ backgroundColor: '#d4e0ed', color: '', borderRadius: 0 }}>
          <div
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <h4 style={{ color: '#333333', margin: 0, padding: '1rem' }}>
              Slide {this.props.currentSlideIndex + 1}
            </h4>
            <Button
              basic
              loading={loading}
              disabled={loading || value.trim() === this.props.value.trim() || !value.trim()}
              style={{ backgroundColor: 'transparent', boxShadow: 'none', margin: 0, padding: '1rem' }}
              onClick={() => this.props.onSave(value)}
            >
              Update
            </Button>
          </div>
        </Card.Header>
        <div
          style={{ margin: 0, padding: 0, position: 'relative' }}
        >
          <TextArea
            disabled={this.props.disabled}
            style={{ padding: 20, paddingRight: 40, width: '100%', border: 'none' }}
            rows={6}
            placeholder="Translate slide text"
            value={value}
            onChange={(e, { value }) => { this.onValueChange(value, this.props.currentSlideIndex, this.props.currentSubslideIndex) }}
          />

          {/* {this._renderSlideTranslateBoxV2()} */}
        </div>
      </Card>
    )
  }
}

TranslateBoxV2.propTypes = {
  value: PropTypes.string,
  loading: PropTypes.bool,
  saveDisabled: PropTypes.bool,
  onSave: PropTypes.func,
}

TranslateBoxV2.defaultProps = {
  value: '',
  saveDisabled: false,
  looading: false,
  onSave: () => { },
}

export default TranslateBoxV2;
