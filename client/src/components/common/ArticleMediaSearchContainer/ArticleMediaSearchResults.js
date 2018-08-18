import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Grid, Image } from 'semantic-ui-react'
import { Scrollbars } from 'react-custom-scrollbars'

import StateRenderer from '../../common/StateRenderer'

class ArticleMediaSearchResults extends Component {

  _renderItems () {
    const { searchGifs, searchImages, isImageTab } = this.props
    if (!searchImages.length && !searchGifs.length) {
      return <p>Type in your search. Press Enter. Find the perfect image.</p>
    }

    if(isImageTab){
      return searchImages.map((image, index) => 
        <Grid.Column key={image.url} className="c-bing__search-column">
          <Image src={image.url} data-orig={image.url} className="c-bing__result-image" />
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
    const { fetchImagesFromWikimediaCommonsState, fetchGifsFromGiphyState, isImageTab } = this.props

    return (
      <div>
        <StateRenderer
          componentState={isImageTab ? fetchImagesFromWikimediaCommonsState : fetchGifsFromGiphyState}
          loaderMessage="Hold Tight! Loading images..."
          errorMessage="Error while loading images! Please try again later!"
          onRender={() => this._render()}
        />
      </div>
    )
  }
}

ArticleMediaSearchResults.propTypes = {
  dispatch: PropTypes.func.isRequired,
  fetchImagesFromBingState: PropTypes.string,
  searchImages: PropTypes.array,
  searchGifs: PropTypes.array,
  fetchGifsFromGiphyState: PropTypes.string,
}

const mapStateToProps = (state) =>
  Object.assign({}, state.article)
export default connect(mapStateToProps)(ArticleMediaSearchResults)
