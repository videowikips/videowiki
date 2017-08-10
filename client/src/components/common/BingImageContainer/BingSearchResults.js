import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Grid, Image } from 'semantic-ui-react'
import { Scrollbars } from 'react-custom-scrollbars'

import StateRenderer from '../../common/StateRenderer'

class BingSearchResults extends Component {

  _renderItems () {
    const { searchGifs, searchImages } = this.props

    if(this.props.images){
      return searchImages.map((image, index) => 
        <Grid.Column key={index} className="c-bing__search-column">
          <Image src={image.thumbnail} data-orig={image.original} className="c-bing__result-image" />
        </Grid.Column>
      )
    } else {
      return searchGifs.map((gif, index) => 
        <Grid.Column key={index} className="c-bing__search-column">
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
// 
  render () {
    const { fetchImagesFromBingState ,fetchGifsFromBingState } = this.props

    return (
      <div>
      <StateRenderer
        componentState={fetchImagesFromBingState }
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
  fetchGifsFromBingState: PropTypes.string,
  searchImages: PropTypes.array,
  searchGifs: PropTypes.array,
}

const mapStateToProps = (state) =>
  Object.assign({}, state.article)
export default connect(mapStateToProps)(BingSearchResults)
  //   _renderItems () {
  //   const { searchImages,searchGifs } = this.props
  //   let showImage;
  //   let items = []
  //   if(this.props.images){
  //       items = searchImages.map((image, index)=>
  //         return(
  //       <Grid.Column key={index} className="c-bing__search-column">
  //         <Image src={image.thumbnail} data-orig={image.original} className="c-bing__result-image" />
  //       </Grid.Column>))
  //   } else {
  //       items = searchGifs.map((gif, index)=>
  //         return(
  //                 <Grid.Column key={index} className="c-bing__search-column">
  //                   <Image src={gif.images.original.url} className="c-bing__result-image" />
  //                 </Grid.Column>))
  //    }
  //   return ({items}) 
  // }