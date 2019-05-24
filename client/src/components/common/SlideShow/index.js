import React, { Component, PropTypes } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import ReactPlayer from 'react-player';

const REFRESH_INTERVAL = 20;

class Slideshow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentSlide: props.defaultIndex,
      slideInterval: props.slideInterval,
      effect: props.effect,
      slides: props.slides.length > 0 ? props.slides : props.children,
      startAt: null,
      consumedTime: 0,
      remainingTime: 0,
    };
    this.consumedTime = 0;
    this.runSlideShow = this.runSlideShow.bind(this);
    this.autoSlideshow = this.autoSlideshow.bind(this);
    this.restartSlideshow = this.restartSlideshow.bind(this);
  }

  componentDidMount() {
    if (this.props.playing) this.runSlideShow(this.state.slides[0].time);
  }

  componentWillUpdate(nextProps) {
    if (this.props.playing !== nextProps.playing) {
      if (nextProps.playing) {
        this.restartSlideshow()
      } else {
        this.stopSlideShow();
      }
    }
  }

  runSlideShow(interval) {
    if (!interval) return;
    this.consumedTime = 0;
    // Run the slide transition after "interval" amount of time
    setTimeout(this.autoSlideshow, interval);
    const intervalId = setInterval(() => {
      if (this.props.playing) {
        this.consumedTime = this.consumedTime + REFRESH_INTERVAL;
      }
    }, REFRESH_INTERVAL);
    this.setState({
      intervalId,
    });
  }

  stopSlideShow() {
    clearInterval(this.state.intervalId);
  }

  restartSlideshow() {
    if (this.state.intervalId) {
      this.stopSlideShow();
    }
    const { currentSlide, slides } = this.state;
    if (this.consumedTime && (this.consumedTime < slides[currentSlide].time - REFRESH_INTERVAL)) {
      this.runSlideShow(slides[currentSlide].time - this.consumedTime);
    } else {
      this.runSlideShow(this.state.slides[this.state.currentSlide].time);
    }
  }

  componentWillUnmount() {
    this.stopSlideShow();
  }

  autoSlideshow() {
    if (this.state.currentSlide === this.state.slides.length - 1 && !this.props.repeat) {
      // if (this.props.resetOnFinish) {
      //   this.setState({ currentSlide: 0 }, () => {
      //     this.props.onSlideChange(0);
      //   });
      // }
      this.setState({ remainingTime: 0, startAt: null });
      return this.stopSlideShow();
    }
    if (!this.props.playing) return;
    const currentSlide = (this.state.currentSlide + 1) % this.state.slides.length;
    this.setState({
      currentSlide,
      remainingTime: 0,
      startAt: null,
    }, () => {
      this.props.onSlideChange(this.state.currentSlide);
      this.stopSlideShow();
      this.runSlideShow(this.state.slides[currentSlide].time);
    });
  }

  generateRenderedSlides(slides) {
    const renderedSlides = [];
    slides.forEach((slide) => {
      const array = slide.url.split('.')
      const format = array[array.length - 1]
      switch (format) {
        case 'mp4':
        case 'ogg':
        case 'ogv':
        case 'webm':
          renderedSlides.push({
            component: (
              <ReactPlayer
                url={slide.url}
                width="100%"
                height="100%"
                playing={slide.playing}
                volume={0}
                style={{ width: '100%', height: '100%' }}
              />
            ),
            time: slide.time,
          })
          break
        default:
          renderedSlides.push({
            component: (
              <div className="carousel__image_wrapper">
                <ReactCSSTransitionGroup
                  transitionName="scale"
                  transitionAppear={true}
                  transitionLeave={false}
                  transitionAppearTimeout={20000}
                  transitionEnterTimeout={5000}
                  transitionLeaveTimeout={0}
                  className="carousel__image"
                >
                  <img
                    src={slide.url}
                    alt=""
                    className={this.getZoomEffectClass()}
                    style={{ height: '100%' }}
                  />
                </ReactCSSTransitionGroup>
              </div>
            ),
            time: slide.time,
          })
          break
      }
    });
    return renderedSlides;
  }

  getZoomEffectClass() {
    const index = Math.floor((Math.random() * ZOOM_EFFECT_CLASSES.length));
    return ZOOM_EFFECT_CLASSES[index];
  }

  render() {
    const { slides, effect } = this.state;
    const renderedSlides = this.generateRenderedSlides(slides);
    const slideEffect = effect === undefined ? 'fade' : effect;

    const slideShowSlides = renderedSlides.map((slide, i) => (
      <li
        className={`slide ${effect} ${
          this.state.currentSlide === i ? `showing-${slideEffect}` : ''
        }`}
        key={`mutlimedia-slide${i}`}
      >
        {slide.component}
      </li>
    ))

    return (
      <div
        style={{
          position: 'absolute',
          height: this.props.height || '100%',
          width: this.props.width || '100%',
        }}
      >
        <div className="slideshow-container">
          <ul className="slides">{slideShowSlides}</ul>
        </div>
      </div>
    );
  }
}

Slideshow.propTypes = {
  showIndex: PropTypes.bool,
  showArrows: PropTypes.bool,
  playing: PropTypes.bool,
  enableKeyboard: PropTypes.bool,
  repeat: PropTypes.bool,
  useDotIndex: PropTypes.bool,
  slideInterval: PropTypes.number,
  defaultIndex: PropTypes.number,
  effect: PropTypes.string,
  slides: PropTypes.array,
  children: PropTypes.array,
  height: PropTypes.string,
  width: PropTypes.string,
  onSlideChange: PropTypes.func,
  resetOnFinish: PropTypes.bool,
};

Slideshow.defaultProps = {
  showIndex: false,
  repeat: false,
  showArrows: true,
  playing: true,
  enableKeyboard: true,
  useDotIndex: false,
  slideInterval: 2000,
  defaultIndex: 0,
  effect: 'fade',
  slides: [],
  height: '100%',
  width: '100%',
  onSlideChange: () => {},
  resetOnFinish: false,
};

export default Slideshow;


const ZOOM_EFFECT_CLASSES = [
  'zoom-t-l',
  'zoom-t-r',
  'zoom-b-l',
  'zoom-b-r',
]
