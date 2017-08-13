import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Grid, Image } from 'semantic-ui-react'
import { Scrollbars } from 'react-custom-scrollbars'

import StateRenderer from '../../common/StateRenderer'

class BingSearchResults extends Component {

  _renderItems () {
    const { searchGifs, searchImages, isImageTab } = this.props

    if(isImageTab){
      return searchImages.map((image, index) => 
        <Grid.Column key={image.original} className="c-bing__search-column">
          <Image src={image.thumbnail} data-orig={image.original} className="c-bing__result-image" />
        </Grid.Column>
      )
    } else {
      return searchGifs.map((gif, index) => 
        <Grid.Column key={gif.images.original.url} className="c-bing__search-column">
          <Image src={gif.images.original.url}  data-orig={gif.images.original.url} className="c-bing__result-image" />
        </Grid.Column>
       )
    }
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
      <div>
      <StateRenderer
        componentState={fetchImagesFromBingState || fetchGifsFromBingState }
        loaderMessage="Hold Tight! Loading images..."
        errorMessage="Error while loading images! Please try again later!"
        onRender={() => this._render()}
      />
      </div>
    )
  }
}

BingSearchResults.propTypes = {
  dispatch: PropTypes.func.isRequired,
  fetchImagesFromBingState: PropTypes.string,
  searchImages: PropTypes.array,
  searchGifs: PropTypes.array,
  fetchGifsFromBingState: PropTypes.string,
}

const mapStateToProps = (state) =>
  Object.assign({}, state.article)
export default connect(mapStateToProps)(BingSearchResults)
