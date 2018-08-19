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
      if (searchImages.length == 0) {
        return <p>No Images have matched your search. Try again.</p>        
      }
      return searchImages.map((image, index) => 
        <Grid.Column key={image.url} className="c-bing__search-column">
          <Image src={image.url} data-orig={image.url} data-orig-desc={image.descriptionurl} className="c-bing__result-image" />
        </Grid.Column>
      )
    } else {
      if (searchGifs.length == 0) {
        return <p>No Gifs have matched your search. Try again.</p>
      }
      return searchGifs.map((gif, index) => 
        <Grid.Column key={gif.url} className="c-bing__search-column">
          <Image src={gif.url}  data-orig={gif.url} className="c-bing__result-image" />
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
    const { fetchImagesFromWikimediaCommonsState, fetchGifsFromWikimediaCommonsState, isImageTab } = this.props

    return (
      <div>
        <StateRenderer
          componentState={isImageTab ? fetchImagesFromWikimediaCommonsState : fetchGifsFromWikimediaCommonsState}
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
  fetchImagesFromWikimediaCommonsState: PropTypes.string,
  searchImages: PropTypes.array,
  searchGifs: PropTypes.array,
  fetchGifsFromWikimediaCommonsState: PropTypes.string,
}

const mapStateToProps = (state) =>
  Object.assign({}, state.article)
export default connect(mapStateToProps)(ArticleMediaSearchResults)
