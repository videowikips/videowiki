import React, { Component, PropTypes } from 'react'
import Dropzone from 'react-dropzone'

const smiley = '/img/smiley.png'

export default class EditorSlide extends Component {
  componentWillReceiveProps (nextProps) {
    if (this.props.isPlaying !== nextProps.isPlaying) {
      if (nextProps.isPlaying) {
        if (this.audioPlayer) {
          this.audioPlayer.play()
        }
        if (this.videoPlayer) {
          this.videoPlayer.play()
        }
      } else {
        if (this.audioPlayer) {
          this.audioPlayer.pause()
        }
        if (this.videoPlayer) {
          this.videoPlayer.pause()
        }
      }
    }
  }

  _handleFileUpload () {

  }

  _renderDefaultContent () {
    const { media, mediaType } = this.props
    return mediaType === 'video' ? (
      <video
        ref={ (videoPlayer) => { this.videoPlayer = videoPlayer } }
        muted={ true }
        className="c-editor__content-video"
        src={ media }
      />
    ) : (
      <div className="c-editor__content-default">
        <img className="c-editor__content-smiley" src={smiley}/>
        <div className="c-editor__content-text">
          <p>Click here to upload an image or video</p>
          <p>to make this article better.</p>
          <p>Or</p>
          <p>Just drag and drop them here</p>
        </div>
      </div>
    )
  }

  render () {
    const { description, audio, onSlidePlayComplete, isPlaying } = this.props

    return (
      <div className="c-editor__content-area">
        <div className="c-editor__content--media">
          <Dropzone onDrop={this._handleFileUpload.bind(this)} className="c-editor__content--dropzone">
            { this._renderDefaultContent() }
          </Dropzone>
        </div>
        <div className="c-editor__content--description">
          <audio
            autoPlay={ isPlaying }
            ref={ (audioPlayer) => { this.audioPlayer = audioPlayer } }
            src={ audio }
            onEnded={() => onSlidePlayComplete()}
          />
          <span className="c-editor__content--description-text">{ description }</span>
        </div>
      </div>
    )
  }
}

EditorSlide.propTypes = {
  description: PropTypes.string.isRequired,
  audio: PropTypes.string.isRequired,
  media: PropTypes.string,
  mediaType: PropTypes.string,
  onSlidePlayComplete: PropTypes.func.isRequired,
  isPlaying: PropTypes.bool.isRequired,
}
