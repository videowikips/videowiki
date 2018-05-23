import React, { Component, PropTypes } from 'react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import $ from 'jquery'
import ArticleSummary from './ArticleSummary'

class AudioPlayer extends Component {

  constructor(props) {
    super(props)
    this.state = {
      linkHovered: false, 
      selectedTitle: '', 
      mousePosition: {
        x: 0, 
        y: 0
      }
    }

  }
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
    this.registerLinksHoverAction();
  }

  componentDidUpdate() {
    this.registerLinksHoverAction();
  }

  registerLinksHoverAction() {
    let links = $('.c-editor__content--description-text a');
    links.off('mouseover');
    links.off('mouseleave');

    links.hover((e) => {
      let title = e.target.getAttribute('href').replace('/wiki/', '')
      let mousePosition = {
        x: e.offsetX,
        y: e.offsetY
      }
      if (!this.state.linkHovered)
        this.setState({linkHovered: true, selectedTitle: title, mousePosition: mousePosition});
    }, (e) => {
      this.resetState();      
    })

  }

  resetState() {
    this.setState({linkHovered: false, selectedTitle: ''})
  }

  renderSummary() {

    if (!this.state.linkHovered) {
      return '';
    }
    
    return (
      <ArticleSummary position={this.state.mousePosition} title={this.state.selectedTitle}>
      </ArticleSummary> 
    )

  }

  render () {
    const { isPlaying, onSlidePlayComplete, audio, description } = this.props

    return (
      <div className="c-editor__content--container">
        <div className="c-editor__content--description">
          <audio
            autoPlay={ isPlaying }
            ref={ (audioPlayer) => { this.audioPlayer = audioPlayer } }
            src={ audio }
            onEnded={() => {onSlidePlayComplete(); this.resetState()}}
            onLoadedData={() => this.onAudioLoad()}
          />
          <ReactCSSTransitionGroup
            transitionName="slideup"
            transitionAppear={true}
            transitionLeave={false}
            transitionAppearTimeout={500}
            transitionEnterTimeout={500}
            transitionLeaveTimeout={0}
          >
            <span className="c-editor__content--description-text" 
              key={description} 
              dangerouslySetInnerHTML={{ __html: description}} 
              ></span>
          </ReactCSSTransitionGroup>

        </div>
      {this.renderSummary()}
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
