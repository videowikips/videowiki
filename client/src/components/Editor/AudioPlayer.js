import React, { Component, PropTypes } from 'react'

class AudioPlayer extends Component {
  componentWillReceiveProps (nextProps) {
    if (this.props.playbackSpeed !== nextProps.playbackSpeed) {
      this.audioPlayer.playbackRate = nextProps.playbackSpeed
    }
    if (this.props.isPlaying !== nextProps.isPlaying) {
      if (nextProps.isPlaying) {
        if (this.audioPlayer) {
          this.audioPlayer.play()
        }
      } else {
        if (this.audioPlayer) {
          this.audioPlayer.pause()
        }
      }
    }
  }

  onAudioLoad () {
    this.audioPlayer.playbackRate = this.props.playbackSpeed
  }

  componentDidMount () {
    this.audioPlayer.playbackRate = this.props.playbackSpeed
  }

  render () {
    const { isPlaying, onSlidePlayComplete, audio, description } = this.props

    return (
      <div className="c-editor__content--description">
        <audio
          autoPlay={ isPlaying }
          ref={ (audioPlayer) => { this.audioPlayer = audioPlayer } }
          src={ audio }
          onEnded={() => onSlidePlayComplete()}
          onLoadedData={() => this.onAudioLoad()}
        />
        <span className="c-editor__content--description-text">{ description }</span>
      </div>
    )
  }
}

AudioPlayer.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  onSlidePlayComplete: PropTypes.func.isRequired,
  audio: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  playbackSpeed: PropTypes.number.isRequired,
}

export default AudioPlayer
