import React from 'react';
import PropTypes from 'prop-types'
import classnames from 'classnames';
import { Grid, Icon, Button, Card } from 'semantic-ui-react';

class SlidesListV2 extends React.Component {
  getsubSlideBorderColor(subslide) {
    if (subslide.text && subslide.audio) {
      return 'green';
    } else {
      return 'gray';
    }
  }

  renderSubslide(slide, index, maxIndex) {
    const completed = slide.completed
    return (
      <Grid.Row
        key={`slide-list-${slide.position}`}
        onClick={() => this.props.onSubslideClick(index)}
      >
        <Grid.Column width={16}>
          <div
            className={classnames({ "slide-item": true, active: index === this.props.currentSlideIndex })}
          >
            <span>
              Slide {index + 1}
            </span>
            <div>
              <span className="timing">
                {/* {formatTime(subslide.startTime * 1000)} - {formatTime(subslide.endTime * 1000)} */}
              </span>
              {completed && (
                  <Icon className="marker-icons" name="check circle" color="green" />
              )}
            </div>
          </div>
        </Grid.Column>
      </Grid.Row>
    )
  }

  render() {
    return (
      <Grid className="slides-list-v2">
        {this.props.slides.map(this.renderSubslide.bind(this))}
      </Grid>
    )
  }

}

SlidesListV2.propTypes = {
  slides: PropTypes.array,
  currentSlideIndex: PropTypes.number,
  translateable: PropTypes.bool,
  onSubslideClick: PropTypes.func,
}

SlidesListV2.defaultProps = {
  slides: [],
  currentSlideIndex: 0,
  translateable: false,
  onSubslideClick: () => { },
}

export default SlidesListV2;
