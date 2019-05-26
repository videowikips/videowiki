import React, { PropTypes } from 'react';
import { Grid } from 'semantic-ui-react'
import { debounce } from 'lodash'

// import { Range } from 'rc-slider';
// We can just import Slider or Range to reduce bundle size
// import Slider from 'rc-slider/lib/Slider';
import Range from 'rc-slider/lib/Range';
import 'rc-slider/assets/index.css';

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

const images = [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Salmonella_typhi_typhoid_fever_PHIL_2215_lores.jpg/400px-Salmonella_typhi_typhoid_fever_PHIL_2215_lores.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Salmonella_typhi_typhoid_fever_PHIL_2215_lores.jpg/400px-Salmonella_typhi_typhoid_fever_PHIL_2215_lores.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Salmonella_typhi_typhoid_fever_PHIL_2215_lores.jpg/400px-Salmonella_typhi_typhoid_fever_PHIL_2215_lores.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Salmonella_typhi_typhoid_fever_PHIL_2215_lores.jpg/400px-Salmonella_typhi_typhoid_fever_PHIL_2215_lores.jpg',
];

const TRACK_STYLES = { backgroundColor: 'red', height: 100 };
const HANDLE_STYLES = { backgroundColor: '#2185d0', height: 100, border: 'none', borderRadius: 0, marginTop: 0 };
const RAIL_STYLES = { backgroundColor: 'black', height: 100 };

class EditorTimeline extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: [],
      mappedValues: [],
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
    this.setState({ value, mappedValues });
  }

  onChange(values) {
    const mappedValues = calculateDurationFromPercentage(this.props.currentSlide.duration, mapValues(filterLastItem(values)));
    this.setState({ value: values, mappedValues });
    this.onDurationsChange(this.props.currentSlide, mappedValues);
  }

  getTrackStyles() {
    return this.props.currentSlide.media.map(({ url }) => (
      { ...TRACK_STYLES, background: `url(${url}) no-repeat center`, backgroundSize: 'contain' }
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

  render() {
    return (
      <div style={{ padding: '2rem', fontWeight: 'bold', fontSize: '1.2rem', border: '1px solid #444', borderTop: 0, background: '#eee' }}>
        <Grid verticalAlign="middle" centered>
          <Grid.Row>
            <Grid.Column computer={4} mobile={4}>
              Timeline
            </Grid.Column>

            <Grid.Column computer={12} mobile={16}>
              <Range
                // key={'range' + this.props.currentSlideIndex}
                style={{ height: 100 }}
                defaultValue={this.state.value}
                value={this.state.value}
                allowCross={false}
                min={0}
                max={100}
                onChange={this.onChange.bind(this)}
                trackStyle={this.getTrackStyles()}
                handleStyle={this.getHandleStyles()}
                railStyle={this.getRailStyles()}
              />
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
}

EditorTimeline.defaultProps = {
  onDurationsChange: () => {},
}

export default EditorTimeline;
