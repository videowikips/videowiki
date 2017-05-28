import React, { Component, PropTypes } from 'react'
import { Button, Icon } from 'semantic-ui-react'

export default class EditorFooter extends Component {
  render () {
    const { onSlideBack, onSlideForward, onPlay, currentSlideIndex, totalSlideCount } = this.props
    return (
      <div className="c-editor__footer">
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
            onClick={() => onPlay()}
          >
            <Icon name="play" />
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
  onPlay: PropTypes.func.isRequired,
}
