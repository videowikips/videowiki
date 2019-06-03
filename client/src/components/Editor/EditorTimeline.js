import React, { PropTypes } from 'react';
import { Grid, Popup, Icon } from 'semantic-ui-react'
import { debounce } from 'lodash'
import Range from 'rc-slider/lib/Range';
import 'rc-slider/assets/index.css';
import ProgressSoundPlayer from '../common/ProgressSoundPlayer';
import { getUrlMediaType } from '../../utils/helpers';
import { VIDEO_PLAYER_THUMBNAIL_IMAGE } from '../../constants';

function filterLastItem(arr) {
  const newArr = arr.slice();
  newArr.pop();
  return newArr;
}

function mapValues(arr) {
  const consumed = [];
  const values = [];
  arr.forEach((item, index) => {
    let v;
    if (index === arr.length - 1) {
      v = 100 - item;
    } else {
      v = arr[index + 1] - item;
    }
    values.push(v);
    consumed.push(v);
  })
  return values;
}

function formatTime(time) {
  return Number.parseFloat(time / 1000).toPrecision(2)
}

function calculatePercentageFromDuration(totalDuration, durations) {
  const percentages = [];
  durations.forEach((duration, index) => {
    const percentage = duration / totalDuration * 100;
    if (index === 0) {
      percentages.push(percentage);
    } else {
      percentages.push(percentages[index - 1] + percentage);
    }
  })
  return percentages;
}

function calculateDurationFromPercentage(totalDuration, percentages) {
  const durations = [];
  percentages.forEach((percentage) => {
    const duration = percentage * totalDuration / 100;
    durations.push(duration);
  })
  return durations;
}

const TRACK_STYLES = { backgroundColor: 'red', height: 100 };
const HANDLE_STYLES = { backgroundColor: '#2185d0', height: 100, border: 'none', borderRadius: 0, marginTop: 0 };
const RAIL_STYLES = { backgroundColor: 'black', height: 100 };

class EditorTimeline extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: [],
      mappedValues: [],
      marks: {},
      trackStyles: [],
      handleStyles: [],
    }
  }

  componentDidMount() {
    if (this.props.currentSlide) this.setCurrentSlideTimeline(this.props.currentSlide);
    this.onDurationsChange = debounce(this.props.onDurationsChange, 2000);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.currentSlideIndex !== nextProps.currentSlideIndex) {
      this.props.onDurationsChange(this.props.currentSlide, this.state.mappedValues);
      this.setCurrentSlideTimeline(nextProps.currentSlide);
    }
  }

  setCurrentSlideTimeline(slide) {
    const { duration } = slide;
    let { media } = slide;
    media = filterLastItem(media);
    const mediaTimings = calculatePercentageFromDuration(duration, media.map((mItem) => mItem.time));
    const value = [0, ...mediaTimings, 100];
    const mappedValues = calculateDurationFromPercentage(duration, mapValues(filterLastItem(value)));
    const marks = this.getMarks(value, duration);
    const trackStyles = slide.media.map(({ url }) => (
      {
        ...TRACK_STYLES,
        background: `url(${getUrlMediaType(url) === 'video' ? VIDEO_PLAYER_THUMBNAIL_IMAGE : url}) center center / contain no-repeat`,
      }
    ));
    const handleStyles = [{ display: 'none' }].concat(filterLastItem(slide.media).map((image, index) => (
      HANDLE_STYLES
    )));
    handleStyles.push({ display: 'none' });
    this.setState({ value, mappedValues, marks, trackStyles, handleStyles });
  }

  onChange(values) {
    if (this.props.currentSlide.media && this.props.currentSlide.media.length > 1) {
      const mappedValues = calculateDurationFromPercentage(this.props.currentSlide.duration, mapValues(filterLastItem(values)));
      const marks = this.getMarks(values, this.props.currentSlide.duration);
      this.setState({ value: values, mappedValues, marks });
      this.onDurationsChange(this.props.currentSlide, mappedValues);
    }
  }

  getMarks(value, duration) {
    if (!value) return;
    const marks = {};
    const valueSlice = value.slice();
    valueSlice.splice(0, 1);
    const mappedValues = calculateDurationFromPercentage(duration, mapValues(filterLastItem(value)));
    valueSlice.forEach((val, index) => {
      if (mappedValues[index]) {
        marks[val] = { label: `${formatTime(mappedValues[index])}s`, style: { top: -35, color: 'black' } }
      }
    })
    return marks;
  }

  getTrackStyles() {
    return this.props.currentSlide.media.map(({ url }) => (
      {
        ...TRACK_STYLES,
        background: `url(${getUrlMediaType(url) === 'video' ? VIDEO_PLAYER_THUMBNAIL_IMAGE : url}) center center / contain no-repeat`,
      }
    ));
  }

  getHandleStyles() {
    const handleStyles = [{ display: 'none' }].concat(filterLastItem(this.props.currentSlide.media).map((image, index) => (
      HANDLE_STYLES
    )));
    handleStyles.push({ display: 'none' })
    return handleStyles;
  }

  getRailStyles() {
    return RAIL_STYLES;
  }

  getStreamUrl() {
    return this.props.currentSlide.audio.indexOf('http') === -1 ? `https:${this.props.currentSlide.audio}` : this.props.currentSlide.audio;
  }

  render() {
    return (
      <div style={{ padding: '2rem', paddingTop: '1rem', fontWeight: 'bold', fontSize: '1.2rem', border: '1px solid #444', borderTop: 0, background: '#eee' }}>
        <Grid verticalAlign="middle" centered>
          <Grid.Row>
            <Grid.Column computer={4} mobile={4}>
              Timing
              <Popup trigger={<Icon name="info circle" className="pl1" />} content={
                <div>
                  <div>
                    Control the Timing of the slide's media by adjusting the drag bar on the right
                    to match the required position in the bottom audio player
                  </div>
                </div>
              }
              />
            </Grid.Column>

            <Grid.Column computer={12} mobile={16}>
              <Grid.Row>

                <Grid.Column width={16}>
                  {this.props.currentSlide && (
                    <ProgressSoundPlayer
                      key={`progress-player-stream-${this.getStreamUrl()}`}
                      streamUrl={this.getStreamUrl()}
                      ref={(ref) => this.SoundPlayerRef = ref}
                      preload={'auto'}
                      isPlaying={this.props.isPlaying}
                      onAudioLoad={this.props.onAudioLoad}
                      onStopTrack={this.props.onPlayComplete}
                      onSeekEnd={this.props.onSeekEnd}
                    />
                  )}
                </Grid.Column>
                <Grid.Column width={16}>
                  <Range
                    key={`range-slider-${this.props.currentSlideIndex}`}
                    style={{ height: 100 }}
                    defaultValue={this.state.value}
                    value={this.state.value}
                    allowCross={false}
                    min={0}
                    dotStyle={{ display: 'none' }}
                    marks={this.state.marks}
                    onChange={this.onChange.bind(this)}
                    trackStyle={this.state.trackStyles}
                    handleStyle={this.state.handleStyles}
                    railStyle={this.getRailStyles()}
                  />
                </Grid.Column>
              </Grid.Row>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    )
  }
}

EditorTimeline.propTypes = {
  currentSlide: PropTypes.object.isRequired,
  currentSlideIndex: PropTypes.number.isRequired,
  onDurationsChange: PropTypes.func,
  isPlaying: PropTypes.bool.isRequired,
  onAudioLoad: PropTypes.func,
  onPlayComplete: PropTypes.func,
  onSeekEnd: PropTypes.func,
}

EditorTimeline.defaultProps = {
  onDurationsChange: () => {},
  onAudioLoad: () => {},
  onPlayComplete: () => {},
  onSeekEnd: () => {},
}

export default EditorTimeline;
