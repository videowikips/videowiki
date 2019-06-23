import React, { PropTypes } from 'react';
import { Grid } from 'semantic-ui-react';

class SlidesList extends React.Component {
  getSlideBorderColor(slide) {
    if (slide.position === this.props.currentSlideIndex) {
      return '#2185d0';
    } else if (slide.completed && (!this.props.translateable || (this.props.translatedSlides && this.props.translatedSlides[slide.position]))) {
      return 'green';
    } else {
      return 'gray';
    }
  }

  renderSlide(slide) {
    console.log(slide)
    let comp;
    if (slide.media && slide.media.length > 0) {
      const url = slide.media[0].smallThumb || slide.media[0].url;
      if (slide.media[0].smallThumb) {
        comp = <img src={url} />;
      } else if (slide.media[0].type === 'video') {
        comp = <video autoPlay={false} preload={false} src={url} width="100%" height="100%" />;
      } else {
        comp = <img src={url} />;
      }
    } else {
      comp = <img src="" alt="Slide image" />
    }

    return (
      <Grid.Column width={8} key={`slide-list-${slide.position}`} style={{ cursor: 'pointer' }} onClick={() => this.props.onSlideClick(slide.position)} >
        <div style={{ border: `3px solid ${this.getSlideBorderColor(slide)}`, padding: 10, height: 80, marginBottom: 10 }} >
          {comp}
        </div>
      </Grid.Column>
    )
  }
  render() {
    return (
      <Grid style={{ maxHeight: '400px', overflowY: 'scroll', border: '3px solid #eee', marginLeft: 0, marginRight: 0 }} >
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
  translateable: PropTypes.bool,
  translatedSlides: PropTypes.object,
  onSlideClick: PropTypes.func,
}

SlidesList.defaultProps = {
  slides: [],
  currentSlideIndex: 0,
  translatedSlides: {},
  translateable: false,
  onSlideClick: () => {},
}

export default SlidesList;
