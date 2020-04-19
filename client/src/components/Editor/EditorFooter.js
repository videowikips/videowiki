import React, { Component, PropTypes } from 'react'
import { Button, Icon } from 'semantic-ui-react'
import moment from 'moment'

import VoiceSpeedController from './VoiceSpeedController'
import { NotificationManager } from 'react-notifications';

export default class EditorFooter extends Component {
  _renderPlayIcon() {
    const { isPlaying } = this.props

    const icon = isPlaying ? 'pause' : 'play'

    return (
      <Icon name={icon} />
    )
  }

  _renderToggleButton() {
    return this.props.hideSidebarToggle ? null
      : (
        <Button
          basic
          icon
          className="c-editor__footer-sidebar c-editor__toolbar-publish"
          onClick={() => this.props.toggleSidebar()}
        >
          <Icon name="content" />
        </Button>
      )
  }

  render() {
    const { onSlideBack, onSlideForward, togglePlay, currentSlideIndex, totalSlideCount, updatedAt, uploadState } = this.props
    const date = moment(updatedAt)

    return (
      <div className="c-editor__footer">
        {this._renderToggleButton()}

        <Button
          basic
          icon
          className="c-editor__toolbar-publish"
          onClick={this.props.onCCToggle}
        >
          <Icon name="cc" />
        </Button>
        <VoiceSpeedController
          onSpeedChange={(value) => this.props.onSpeedChange(value)}
        />
        <span className="c-editor__footer-controls">
          <Button
            basic
            icon
            className="c-editor__toolbar-publish"
            onClick={() => uploadState !== 'loading' ? onSlideBack()
              : NotificationManager.info('An upload is already in progress, please hold')
            }
            disabled={currentSlideIndex === 0}
          >
            <Icon name="step backward" />
          </Button>
          <Button
            basic
            icon
            className="c-editor__toolbar-publish"
            onClick={() => togglePlay()}
          >
            {this._renderPlayIcon()}
          </Button>
          <Button
            basic
            icon
            className="c-editor__toolbar-publish"
            onClick={() => uploadState !== 'loading' ? onSlideForward()
              : NotificationManager.info('An upload is already in progress, please hold')
            }
            disabled={currentSlideIndex + 1 === totalSlideCount}
          >
            <Icon name="step forward" />
          </Button>
        </span>
        <span className="c-editor__last-updated">
          {`Last Updated: ${date.format('DD MMMM YYYY')}, at ${date.format('hh:mm')}`}
        </span>
      </div >
    )
  }
}

EditorFooter.defaultProps = {
  onCCToggle: () => {},
}

EditorFooter.propTypes = {
  currentSlideIndex: PropTypes.number.isRequired,
  totalSlideCount: PropTypes.number.isRequired,
  onSlideBack: PropTypes.func.isRequired,
  onSlideForward: PropTypes.func.isRequired,
  togglePlay: PropTypes.func.isRequired,
  isPlaying: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  hideSidebarToggle: PropTypes.bool.isRequired,
  onSpeedChange: PropTypes.func.isRequired,
  updatedAt: PropTypes.string.isRequired,
  uploadState: PropTypes.string.isRequired,
  onCCToggle: PropTypes.func,
}
