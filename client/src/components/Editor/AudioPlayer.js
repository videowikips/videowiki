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
        y: 0,
      },
      playerId: `a${parseInt(Math.random() * 100000000)}`,
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

    // in case the next audio is the same as the current audio
    // replay the audio player manually ( used for development mode )
    if (this.audioPlayer && this.audioPlayer.ended && nextProps.isPlaying && nextProps.audio === this.props.audio ) {
      this.audioPlayer.play();
    }
  }

  onAudioLoad () {
    this.audioPlayer.playbackRate = this.props.playbackSpeed
    this.props.onAudioLoad();
  }

  componentDidMount () {
    if (this.audioPlayer) {
      this.audioPlayer.playbackRate = this.props.playbackSpeed
    }
    this.registerLinksHoverAction();
  }

  componentDidUpdate() {
    this.registerLinksHoverAction();
  }

  registerLinksHoverAction() {
    const links = $(`.c-editor__content--description-text.${this.state.playerId} a`);
    links.off('mouseover');
    links.off('mouseleave');

    links.hover((e) => {
      const title = e.target.getAttribute('href').replace('/wiki/', '')
      const mousePosition = {
        x: e.offsetX,
        y: e.offsetY,
      }
      if (!this.state.linkHovered)
        this.setState({ linkHovered: true, selectedTitle: title, mousePosition });
    }, (e) => {
      this.resetState();
    })
  }

  resetState() {
    this.setState({ linkHovered: false, selectedTitle: '' })
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
    const { isPlaying, onSlidePlayComplete, description, muted } = this.props
    let { audio } = this.props;
    if (process.env.NODE_ENV === 'production' && audio && audio.indexOf('https') === -1) {
      audio = `https:${audio}`
    }
    return (
      <div className="c-editor__content--container">
        <div className="c-editor__content--description">
          {audio && !muted && (
            <audio
              autoPlay={ isPlaying }
              ref={ (audioPlayer) => { this.audioPlayer = audioPlayer } }
              src={ audio }
              onEnded={() => {onSlidePlayComplete(); this.resetState()}}
              onLoadedData={() => this.onAudioLoad()}
            />
          )}
          {this.props.showTextTransition ? (
            <ReactCSSTransitionGroup
              transitionName="slideup"
              transitionAppear={true}
              transitionLeave={false}
              transitionAppearTimeout={500}
              transitionEnterTimeout={500}
              transitionLeaveTimeout={0}
            >
              <span className={`c-editor__content--description-text ${this.state.playerId}`}
                key={description}
                dangerouslySetInnerHTML={{ __html: description }}
              >
              </span>
            </ReactCSSTransitionGroup>
          ) : (

            <span className={`c-editor__content--description-text ${this.state.playerId}`}
              key={description}
              dangerouslySetInnerHTML={{ __html: description }}
            >
            </span>
          )}

        </div>
      {this.renderSummary()}
      </div>
    )
  }
}

AudioPlayer.defaultProps = {
  onAudioLoad: () => {},
}

AudioPlayer.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  onSlidePlayComplete: PropTypes.func.isRequired,
  audio: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  playbackSpeed: PropTypes.number.isRequired,
  showTextTransition: PropTypes.bool.isRequired,
  muted: PropTypes.bool.isRequired,
  onAudioLoad: PropTypes.func,
}

export default AudioPlayer
