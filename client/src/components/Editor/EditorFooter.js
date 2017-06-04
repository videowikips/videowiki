import React, { Component, PropTypes } from 'react'
import { Button, Icon } from 'semantic-ui-react'

export default class EditorFooter extends Component {
  _renderPlayIcon () {
    const { isPlaying } = this.props

    const icon = isPlaying ? 'pause' : 'play'

    return (
      <Icon name={ icon } />
    )
  }

  render () {
    const { onSlideBack, onSlideForward, togglePlay, currentSlideIndex, totalSlideCount, toggleSidebar } = this.props
    return (
      <div className="c-editor__footer">
        <Button
          basic
          icon
          className="c-editor__footer-sidebar c-editor__toolbar-publish"
          onClick={() => toggleSidebar()}
        >
          <Icon name="content" />
        </Button>
        <span className="c-editor__footer-controls">
          <Button
            basic
            icon
            className="c-editor__toolbar-publish"
            onClick={() => onSlideBack()}
            disabled={ currentSlideIndex === 0 }
          >
            <Icon name="step backward" />
          </Button>
          <Button
            basic
            icon
            className="c-editor__toolbar-publish"
            onClick={() => togglePlay()}
          >
            { this._renderPlayIcon() }
          </Button>
          <Button
            basic
            icon
            className="c-editor__toolbar-publish"
            onClick={() => onSlideForward()}
            disabled={ currentSlideIndex + 1 === totalSlideCount }
          >
            <Icon name="step forward" />
          </Button>
        </span>
      </div>
    )
  }
}

EditorFooter.propTypes = {
  currentSlideIndex: PropTypes.number.isRequired,
  totalSlideCount: PropTypes.number.isRequired,
  onSlideBack: PropTypes.func.isRequired,
  onSlideForward: PropTypes.func.isRequired,
  togglePlay: PropTypes.func.isRequired,
  isPlaying: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
}
