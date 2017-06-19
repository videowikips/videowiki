import React, { Component, PropTypes } from 'react'
import Dropzone from 'react-dropzone'
import { Message } from 'semantic-ui-react'
import classnames from 'classnames'

class EditorSlide extends Component {
  constructor (props) {
    super(props)

    this.state = {
      fileUploadError: false,
      errorMessage: '',
      file: null,
      onDragOver: false,
    }
  }

  _onDragLeave () {
    this.setState({
      onDragOver: false,
    })
  }

  _onDragOver () {
    this.setState({
      onDragOver: true,
    })
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

  _handleImageUrlDrop (imageUrlToUpload) {
    this.setState({
      fileUploadError: false,
      errorMessage: '',
      file: null,
    })

    this.props.uploadContent(null, imageUrlToUpload)
  }

  _handleFileUpload (acceptedFiles, rejectedFiles, evt) {
    if (rejectedFiles.length > 0) {
      const file = rejectedFiles[0]
      let errorMessage = ''

      if (file.size > (10 * 1024 * 1024)) {
        errorMessage = 'Max file size limit is 10MB!'
      } else if (file.type.indexOf('video') === -1 && file.type.indexOf('image') === -1) {
        // check if image dropped from container
        if (evt && evt.dataTransfer && evt.dataTransfer.getData('text/html')) {
          const imageUrl = evt.dataTransfer.getData('text/html')

          const rex = /data-orig="?([^"\s]+)"?\s*/
          const url = rex.exec(imageUrl)

          if (url[1]) {
            return this._handleImageUrlDrop(url[1])
          }
        } else {
          errorMessage = 'Only images and videos can be uploaded!'
        }
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

    const boxClassnames = classnames('c-editor__content-default', {
      box__hover: this.state.onDragOver,
    })

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
      <div className={ boxClassnames }>
        <div className="box__input">
          <svg className="box__icon" xmlns="http://www.w3.org/2000/svg" width="50" height="43" viewBox="0 0 50 43"><path d="M48.4 26.5c-.9 0-1.7.7-1.7 1.7v11.6h-43.3v-11.6c0-.9-.7-1.7-1.7-1.7s-1.7.7-1.7 1.7v13.2c0 .9.7 1.7 1.7 1.7h46.7c.9 0 1.7-.7 1.7-1.7v-13.2c0-1-.7-1.7-1.7-1.7zm-24.5 6.1c.3.3.8.5 1.2.5.4 0 .9-.2 1.2-.5l10-11.6c.7-.7.7-1.7 0-2.4s-1.7-.7-2.4 0l-7.1 8.3v-25.3c0-.9-.7-1.7-1.7-1.7s-1.7.7-1.7 1.7v25.3l-7.1-8.3c-.7-.7-1.7-.7-2.4 0s-.7 1.7 0 2.4l10 11.6z"/></svg>
          <label>Choose a file or drag it here.</label>
        </div>
      </div>
    )
  }

  _renderDropzone () {
    return this.props.mode === 'viewer' ? (
      <div className="c-editor__content--dropzone">
        { this._renderDefaultContent() }
      </div>
    ) : (
      <Dropzone
        disablePreview={true}
        accept="image/*, video/*"
        onDrop={this._handleFileUpload.bind(this)}
        className="c-editor__content--dropzone"
        maxSize={ 10 * 1024 * 1024 }
        multiple={ false }
        onDragOver={this._onDragOver.bind(this)}
        onDragLeave={this._onDragLeave.bind(this)}
      >
        { this._renderDefaultContent() }
      </Dropzone>
    )
  }

  render () {
    const { description, audio, onSlidePlayComplete, isPlaying, mode } = this.props

    return (
      <div className="c-editor__content-area">
        { this._renderFileUploadErrorMessage() }
        <div className="c-editor__content--media">
          { this._renderDropzone() }
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
  mode: PropTypes.string,
}

export default EditorSlide
