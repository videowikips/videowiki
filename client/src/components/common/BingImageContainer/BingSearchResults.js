import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Grid, Image } from 'semantic-ui-react'
import { Scrollbars } from 'react-custom-scrollbars'

import StateRenderer from '../../common/StateRenderer'

class BingSearchResults extends Component {
  _renderItems () {
    const { searchImages } = this.props
    return searchImages.map((image, index) => (
      <Grid.Column key={index} className="c-bing__search-column">
        <Image src={image.thumbnail} data-orig={image.original} className="c-bing__result-image" />
      </Grid.Column>
    ))
  }

  _render () {
    return (
      <Grid columns={2} className="c-bing__search-result-container">
        { this._renderItems() }
      </Grid>
    )
  }

  render () {
    const { fetchImagesFromBingState } = this.props
    return (
      <StateRenderer
        componentState={fetchImagesFromBingState}
        loaderMessage="Hold Tight! Loading images..."
        errorMessage="Error while loading images! Please try again later!"
        onRender={() => this._render()}
      />
    )
  }
}

BingSearchResults.propTypes = {
  dispatch: PropTypes.func.isRequired,
  fetchImagesFromBingState: PropTypes.string,
  searchImages: PropTypes.array,
}

const mapStateToProps = (state) =>
  Object.assign({}, state.article)
export default connect(mapStateToProps)(BingSearchResults)
