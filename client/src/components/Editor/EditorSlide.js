import React, { Component, PropTypes } from 'react'
import Dropzone from 'react-dropzone'
import { Message } from 'semantic-ui-react'

const smiley = '/img/smiley.png'

class EditorSlide extends Component {
  constructor (props) {
    super(props)

    this.state = {
      fileUploadError: false,
      errorMessage: '',
      file: null,
    }
  }

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

    if (this.props !== nextProps) {
      this.setState({
        fileUploadError: false,
        errorMessage: '',
        file: null,
      })
    }
  }

  _handleFileUpload (acceptedFiles, rejectedFiles) {
    if (rejectedFiles.length > 0) {
      const file = rejectedFiles[0]
      let errorMessage = ''

      if (file.size > (10 * 1024 * 1024)) {
        errorMessage = 'Max file size limit is 10MB!'
      } else if (file.type.indexOf('video') === -1 && file.type.indexOf('image') === -1) {
        errorMessage = 'Only images and videos can be uploaded!'
      }

      this.setState({
        fileUploadError: true,
        errorMessage,
        file: null,
      })
    } else {
      this.setState({
        fileUploadError: false,
        errorMessage: '',
        file: acceptedFiles[0],
      })

      // TODO: upload to server
      if (acceptedFiles.length > 0) {
        this.props.uploadContent(acceptedFiles[0])
      }
    }
  }

  _handleDismiss () {
    this.setState({
      fileUploadError: false,
    })
  }

  _renderFileUploadErrorMessage () {
    const { errorMessage } = this.state

    return this.state.fileUploadError ? (
      <Message
        negative
        className="c-editor-message"
        onDismiss={() => this._handleDismiss() }
        content={ errorMessage }
      />
    ) : null
  }

  _renderDefaultContent () {
    const { isPlaying } = this.props
    const { file } = this.state

    let media, mediaType

    if (file) {
      media = file.preview
      mediaType = file.type.split('/')[0]
    } else {
      media = this.props.media
      mediaType = this.props.mediaType
    }

    return mediaType === 'video' ? (
      <video
        autoPlay={ isPlaying }
        ref={ (videoPlayer) => { this.videoPlayer = videoPlayer } }
        muted={ true }
        className="c-editor__content-video"
        src={ media }
      />
    ) : mediaType === 'image' ? (
      <img className="c-editor__content-image" src={media}/>
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
        { this._renderFileUploadErrorMessage() }
        <div className="c-editor__content--media">
          <Dropzone
            accept="image/*,video/*"
            onDrop={this._handleFileUpload.bind(this)}
            className="c-editor__content--dropzone"
            maxSize={ 10 * 1024 * 1024 }
            multiple={ false }
          >
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
  uploadContent: PropTypes.func.isRequired,
}

export default EditorSlide
