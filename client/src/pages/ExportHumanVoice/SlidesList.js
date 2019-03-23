import React, { PropTypes } from 'react';
import { Grid } from 'semantic-ui-react';

class SlidesList extends React.Component {
  getSlideBorderColor(slide) {
    if (slide.position === this.props.currentSlideIndex) {
      return '#2185d0';
    } else if (slide.completed) {
      return 'green';
    } else {
      return 'gray';
    }
  }

  renderSlide(slide) {
    let comp;
    if (slide.mediaType === 'video') {
      comp = <video autoPlay={false} src={slide.media} width="100%" height="100%" />;
    } else {
      comp = <img src={slide.media} />;
    }

    return (
      <Grid.Column width={8} >
        <div style={{ border: `2px solid ${this.getSlideBorderColor(slide)}`, padding: 10, height: 80, marginBottom: 10 }} >
          {comp}
        </div>
      </Grid.Column>
    )
  }
  render() {
    return (
      <Grid style={{ maxHeight: '500px', overflowY: 'scroll' }} >
        <Grid.Row>
          {this.props.slides.map((slide) => this.renderSlide(slide))}
        </Grid.Row>
      </Grid>
    )
  }
}

SlidesList.propTypes = {
  slides: PropTypes.array,
  currentSlideIndex: PropTypes.number,
}

SlidesList.defaultProps = {
  slides: [],
  currentSlideIndex: 0,
}

export default SlidesList;