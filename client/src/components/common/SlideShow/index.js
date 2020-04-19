import React, { Component, PropTypes } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import ReactPlayer from 'react-player';

const REFRESH_INTERVAL = 30;
const FADE_DURATION = 0.75;
class Slideshow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentSlide: props.defaultIndex,
      slideInterval: props.slideInterval,
      effect: props.effect,
      slides: props.slides.length > 0 ? props.slides : props.children,
      fade: 'in',
    };
    this.consumedTime = 0;
    this.runSlideShow = this.runSlideShow.bind(this);
    this.autoSlideshow = this.autoSlideshow.bind(this);
    this.restartSlideshow = this.restartSlideshow.bind(this);
  }

  componentDidMount() {
    this.mounted = true;
    if (this.props.playing) this.runSlideShow(this.props.slides[0].time);
  }

  componentWillUpdate(nextProps) {
    if (this.props.playing !== nextProps.playing) {
      if (nextProps.playing && nextProps.isActive) {
        this.restartSlideshow()
      } else {
        this.stopSlideShow();
      }
    }
    if (nextProps.isActive && this.props.defaultStartTime !== nextProps.defaultStartTime) {
      this.onDefaultStartTimeChange(nextProps.defaultStartTime);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
    this.stopSlideShow();
  }

  onDefaultStartTimeChange(newStartTime) {
    if (!this.mounted) return;
    this.stopSlideShow();
    let currentSlide = 0;
    let consumedTime = newStartTime;
    for (let slideIndex = 0; slideIndex < this.props.slides.length; slideIndex++) {
      const slide = this.props.slides[slideIndex];
      if (consumedTime - slide.time > 0) {
        consumedTime -= slide.time;
        currentSlide = slideIndex;
      } else {
        currentSlide = slideIndex;
        break;
      }
    }
    this.consumedTime = consumedTime;
    this.setState({ currentSlide }, () => {
      this.props.onSlideChange(currentSlide);
      if (this.props.slides[currentSlide].type === 'video' && this.playingVideoRef) {
        if (this.props.slides[currentSlide].playing) {
          this.playingVideoRef.getInternalPlayer().pause();
        }
        this.playingVideoRef.getInternalPlayer().currentTime = this.consumedTime / 1000;

        if (this.props.slides[currentSlide].playing) {
          setTimeout(() => {
            this.playingVideoRef.getInternalPlayer().play();
          }, 50);
        }
      }
      if (this.props.playing) {
        this.restartSlideshow();
      }
    })
  }

  runSlideShow(interval) {
    if (!this.mounted) return;
    if (!interval) return;
    // Run the slide transition after "interval" amount of time
    setTimeout(this.autoSlideshow, interval);
    const intervalId = setInterval(() => {
      if (this.props.playing) {
        this.consumedTime = this.consumedTime + REFRESH_INTERVAL;
        if (this.state.fade === 'in' && this.props.slides[this.state.currentSlide].time - this.consumedTime <= FADE_DURATION * 1000) {
          this.setState({ fade: 'out' });
        }
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
    const { currentSlide } = this.state;
    const { slides } = this.props;
    if (this.consumedTime && slides[currentSlide] && (this.consumedTime < slides[currentSlide].time - REFRESH_INTERVAL)) {
      this.runSlideShow(slides[currentSlide].time - this.consumedTime);
    } else if (this.props.slides[this.state.currentSlide]) {
      this.consumedTime = 0;
      this.runSlideShow(this.props.slides[this.state.currentSlide].time);
    }
  }

  autoSlideshow() {
    if (this.state.currentSlide === this.props.slides.length - 1 && !this.props.repeat) {
      // if (this.props.resetOnFinish) {
      //   this.setState({ currentSlide: 0 }, () => {
      //     this.props.onSlideChange(0);
      //   });
      // }
      return this.stopSlideShow();
    }
    if (!this.props.playing) return;
    const currentSlide = (this.state.currentSlide + 1) % this.props.slides.length;
    this.setState({
      currentSlide,
      fade: 'in',
    }, () => {
      this.props.onSlideChange(this.state.currentSlide);
      this.stopSlideShow();
      this.consumedTime = 0;
      this.runSlideShow(this.props.slides[currentSlide].time);
    });
  }

  generateRenderedSlides(slides) {
    const renderedSlides = [];
    slides.forEach((slide, slideIndex) => {
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
                // key={`mutlimedia-slide-${slide.url}`}
                style={{ width: '100%', height: '100%' }}
                ref={(ref) => {
                  if (this.state.currentSlide === slideIndex) {
                    this.playingVideoRef = ref;
                  }
                }}
              />
            ),
            time: slide.time,
            url: slide.url,
          })
          break
        default:
          renderedSlides.push({
            component: (
              <div
                className="carousel__image_wrapper"
                // key={`mutlimedia-slide-${slide.url}`}
                
              >
                <ReactCSSTransitionGroup
                  transitionName="scale"
                  transitionAppear={true}
                  transitionLeave={false}
                  transitionAppearTimeout={20000}
                  transitionEnterTimeout={5000}
                  transitionLeaveTimeout={0}
                  className="carousel__image"
                >
                {!slide.fullWidth && (
                  <img
                  src={slide.url}
                  alt=""
                  className="blurred_background"
                  />
                )}
                  <img
                    src={slide.url}
                    alt=""
                    className={`${slide.fullWidth ? 'stretch' : ''}`}
                    style={{ height: '100%', zIndex: 1 }}
                  />
                </ReactCSSTransitionGroup>
              </div>
            ),
            time: slide.time,
            url: slide.url,
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
    const { effect } = this.state;
    const renderedSlides = this.generateRenderedSlides(this.props.slides);
    const slideEffect = effect === undefined ? 'fade' : effect;
    const slideShowSlides = renderedSlides.map((slide, i) => {
      let showingEffect = '';
      if (this.state.currentSlide === i) {
        if ( this.state.fade === 'in') {
          showingEffect = `showing-${slideEffect}`;
        } else if (this.state.fade === 'out') {
          showingEffect = `showing-${slideEffect}-out`;
        }
      }
      return (
        <li
          className={`slide ${effect} ${showingEffect}`}
          key={`mutlimedia-slide-${slide.url}-${i}`}
        >
          {slide.component}
        </li>
      )
    })

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
  defaultStartTime: PropTypes.number,
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
  defaultStartTime: 0,
};

export default Slideshow;

const ZOOM_EFFECT_CLASSES = [
  'zoom-t-l',
  'zoom-t-r',
  'zoom-b-l',
  'zoom-b-r',
]
