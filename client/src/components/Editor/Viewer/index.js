import React, { Component, PropTypes } from 'react'
import ReactPlayer from 'react-player'
import GifPlayer from 'react-gif-player'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

import Two from './Two'
import Three from './Three'
import Four from './Four'
import Five from './Five'

import AudioPlayer from '../AudioPlayer'

class Viewer extends Component {
  constructor (props) {
    super(props)
    this.media = []
    this.layoutStartSlide = 0
    this.chosenLayout = this._chooseLayout()
  }

  /*
    Selects a layout between 2, 3, 4 and 5 slides randomly.
    If the number of slides are less than 6, return the number of slides as layout
    or 2, whichever is higher.
  */
  _chooseLayout () {
    const { slides } = this.props

    if (slides.length <= 5) {
      return slides.length > 1 ? slides.length : 2
    } else {
      return Math.floor((Math.random() * 4)) + 2
    }
  }

  showItem (item, isActive) {
    const { media } = item

    if (media) {
      const array = media.split('.')
      const format = array[array.length - 1]
      let component
      if (isActive) {
        switch (format) {
          case 'mp4':
            component = (
              <ReactPlayer
                url={media}
                width="100%"
                height="100%"
                playing={this.props.isPlaying}
                volume={0}
                style={{width: '100%', height: '100%'}}
              />
            )
            break
          default:
            component = (
              <img
                src={media}
                alt=""
                style={{ height: '100%' }}
              />
            )
            break
        }
      } else {
        switch (format) {
          case 'mp4':
            component = (
              <ReactPlayer
                height='400px'
                width='initial'
                url={media}
                alt=""
                playing={this.props.isPlaying}
              />
            )
            break
          case 'gif':
            component = (
              <GifPlayer
                gif={media}
              />
            )
            break
          default:
            component = (
              <img
                src={media}
                alt=""
                style={{ height: '100%' }}
              />
            )
            break
        }
      }

      return isActive ? component
        : (
          <div className="outer-container">
            <div className="inner-container">
              <div className="overlay"/>
              {component}
            </div>
          </div>
        )
    }
  }

  renderItems () {
    const { currentSlideIndex, slides } = this.props

    if (currentSlideIndex === 0) {
      this.layoutStartSlide = 0
      this.media = slides.slice(currentSlideIndex, this.chosenLayout + currentSlideIndex)
    } else if (currentSlideIndex >= this.layoutStartSlide + this.chosenLayout) {
      this.chosenLayout = this._chooseLayout()
      this.layoutStartSlide = currentSlideIndex
      this.media = slides.slice(currentSlideIndex, this.chosenLayout + currentSlideIndex)
    } else if (currentSlideIndex < this.layoutStartSlide) {
      this.chosenLayout = this._chooseLayout()
      this.layoutStartSlide = this.layoutStartSlide - this.chosenLayout
      this.media = slides.slice(this.layoutStartSlide, this.layoutStartSlide + this.chosenLayout)
    }

    const current = currentSlideIndex - this.layoutStartSlide

    let layout
    switch (this.chosenLayout) {
      case 5: layout = <Five media={this.media} current={current} renderItem={(item, isActive) => this.showItem(item, isActive)} />; break;
      case 4: layout = <Four media={this.media} current={current} renderItem={(item, isActive) => this.showItem(item, isActive)} />; break;
      case 3: layout = <Three media={this.media} current={current} renderItem={(item, isActive) => this.showItem(item, isActive)} />;break;
      default:layout = <Two media={this.media} current={current} renderItem={(item, isActive) => this.showItem(item, isActive)} />;
    }
    return <div key={this.chosenLayout}>{layout}</div>
  }

  render () {
    const { currentSlideIndex, slides, onSlidePlayComplete, isPlaying, playbackSpeed } = this.props
    const currentSlide = slides[currentSlideIndex]

    const { audio, text } = currentSlide

    return (
      <div className="carousel">
        <ReactCSSTransitionGroup
          transitionName="translate"
          transitionAppear={true}
          transitionLeave={false}
          transitionAppearTimeout={2000}
          transitionEnterTimeout={2000}
          transitionLeaveTimeout={0}
          className="carousel__slide"
        >
          {this.renderItems()}
        </ReactCSSTransitionGroup>
        <AudioPlayer
          description={text}
          audio={audio}
          onSlidePlayComplete={onSlidePlayComplete}
          isPlaying={isPlaying}
          playbackSpeed={playbackSpeed}
        />
      </div>
    )
  }
}

Viewer.propTypes = {
  slides: PropTypes.array,
  currentSlideIndex: PropTypes.number.isRequired,
  isPlaying: PropTypes.bool.isRequired,
  onSlidePlayComplete: PropTypes.func.isRequired,
  playbackSpeed: PropTypes.number.isRequired,
}

export default Viewer
