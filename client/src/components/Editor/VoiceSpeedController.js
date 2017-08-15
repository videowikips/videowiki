import React, { Component, PropTypes } from 'react'
import { Button, Icon } from 'semantic-ui-react'

export default class VoiceSpeedController extends Component {
  constructor (props) {
    super(props)
    this.state = {
      showOptions: false,
    }

    this._showOptions = this._showOptions.bind(this)
    this._setSpeed = this._setSpeed.bind(this)
  }

  _showOptions () {
    this.setState({
      showOptions: true,
    })
  }

  _setSpeed (value) {
    this.props.onSpeedChange(value)
    this.setState({
      showOptions: false,
    })
  }

  _renderVoiceSpeedButton () {
    return !this.state.showOptions ? (
      <Button
        basic
        className="c-editor__toolbar-publish"
        onClick={this._showOptions}
      >
        Voice Speed
      </Button>
    ) : null
  }

  _renderOptions () {
    return this.state.showOptions ? (
      <div>
        <Button
          basic
          className="c-editor__toolbar-publish c-editor__toolbar-speed--control"
          onClick={() => this._setSpeed(0.5)}
        >
          0.5x
        </Button>
        <Button
          basic
          className="c-editor__toolbar-publish c-editor__toolbar-speed--control"
          onClick={() => this._setSpeed(1)}
        >
          1x
        </Button>
        <Button
          basic
          className="c-editor__toolbar-publish c-editor__toolbar-speed--control"
          onClick={() => this._setSpeed(1.25)}
        >
          1.25x
        </Button>
        <Button
          basic
          className="c-editor__toolbar-publish c-editor__toolbar-speed--control"
          onClick={() => this._setSpeed(1.5)}
        >
          1.5x
        </Button>
        <Button
          basic
          className="c-editor__toolbar-publish c-editor__toolbar-speed--control"
          onClick={() => this._setSpeed(2)}
        >
          2x
        </Button>
      </div>
    ) : null
  }

  render () {
    return (
      <div>
        { this._renderVoiceSpeedButton() }
        { this._renderOptions() }
      </div>
    )
  }
}

VoiceSpeedController.propTypes = {
  onSpeedChange: PropTypes.func.isRequired,
}
