import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Grid, Image, Modal, Button, Icon } from 'semantic-ui-react'
import { Scrollbars } from 'react-custom-scrollbars'

import StateRenderer from '../../common/StateRenderer'

class ArticleMediaSearchResults extends Component {
  

  constructor(props) {
    super(props);

    this.videoRefs = {}

    this.state = {
      isVideoModalOpen: false,
      currentVideo: null
    }

  }

  _render() {
    return (
      <Grid columns={2} className="c-bing__search-result-container">
        {this._renderItems()}
        {this.renderVideoModal()}
      </Grid>
    )
  }

  render() {
    const { currentTab, fetchImagesFromWikimediaCommonsState, fetchGifsFromWikimediaCommonsState, fetchVideosFromWikimediaCommonsState } = this.props

    let componentState;
    switch (currentTab) {
      case 'images': componentState = fetchImagesFromWikimediaCommonsState; break;
      case 'gifs': componentState = fetchGifsFromWikimediaCommonsState; break;
      case 'videos': componentState = fetchVideosFromWikimediaCommonsState; break;
      default: componentState = fetchImagesFromWikimediaCommonsState; break;
    }

    return (
      <div>
        <StateRenderer
          componentState={componentState}
          loaderMessage="Hold Tight! Loading images..."
          errorMessage="Error while loading images! Please try again later!"
          onRender={() => this._render()}
        />
      </div>
    )
  }




  _renderItems() {
    const { searchGifs, searchImages, currentTab } = this.props
    if (!searchImages.length && !searchGifs.length) {
      return <p>Type in your search. Press Enter. Find the perfect image.</p>
    }

    switch (currentTab) {
      case 'images': return this._renderImages();
      case 'gifs': return this._renderGifs();
      case 'videos': return this._renderVideos();
      default: return this._renderImages();
    }
  }


  _renderImages() {
    const { searchImages, currentTab } = this.props

    if (searchImages.length == 0) {
      return <p>No Images have matched your search. Try again.</p>
    }

    return searchImages.map((image, index) =>
      <Grid.Column key={image.url} className="c-bing__search-column">
        <Image src={image.url} data-orig={image.url} data-orig-desc={image.descriptionurl} data-orig-mimetype={image.mime} className="c-bing__result-image" />
      </Grid.Column>
    )

  }

  _renderGifs() {
    const { searchGifs, currentTab } = this.props

    if (searchGifs.length == 0) {
      return <p>No Gifs have matched your search. Try again.</p>
    }

    return searchGifs.map((gif, index) =>
      <Grid.Column key={gif.url} className="c-bing__search-column">
        <Image src={gif.url} data-orig={gif.url} data-orig-desc={gif.descriptionurl} data-orig-mimetype={gif.mime} className="c-bing__result-image" />
      </Grid.Column>
    )
  }


  _renderVideos() {
    const { searchVideos } = this.props

    if (searchVideos.length == 0) {
      return <p>No Videos have matched your search. Try again.</p>
    }

    return searchVideos.map((video, index) =>
      <Grid.Column key={video.url} className="c-bing__search-column">
        <video
          draggable
          className="c-bing__result-image"
          width={'100%'}
          ref={(ref) => {this.videoRefs[index] = ref}}
          data-orig={video.url}
          autoPlay={false}
          muted={true}
          src={video.url}
          type={video.mime}
          onMouseOver={() => this.videoRefs[index].play()}
          onMouseLeave={() => {
            this.videoRefs[index].pause(); 
            this.videoRefs[index].currentTime = 0
          }}
          onClick={() => this.setState({ isVideoModalOpen: true, currentVideo: video })}
          onDragStart={(ev) => this.onVideoDragStart(ev, video)}
        />
      </Grid.Column>
    )
  }

  onVideoDragStart(ev, video) {
    // Fake the transfered data to the dropdown zone
    // Provide an image tag with data-origin-mimetype = video to upload the url as video 
    ev.dataTransfer.setData("text/html", `<image data-orig=${video.url} data-orig-desc=${video.descriptionurl} data-orig-mimetype="video/${video.mime.split('/')[1]}" > `);
  }


  renderVideoModal() {

    const { currentVideo, isVideoModalOpen } = this.state;

    if (!currentVideo) {
      return;
    }

    return (
      <Modal
        style={{
          marginTop: '0px !important',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}
        open={isVideoModalOpen}
        onClose={() => this.handleModalClose()}
        size="small"
      >

        <Modal.Actions>
          <Icon onClick={() => this.handleModalClose()} name='close' style={{cursor: 'pointer'}} />
        </Modal.Actions>
        <Modal.Content>
          <video
            className="c-bing__result-image"
            width={'100%'}
            height={'500px'}
            data-orig={currentVideo.url}
            autoPlay={true}
            src={currentVideo.url}
            type={currentVideo.mime}
            controls
          />
        </Modal.Content>
      </Modal>
    )
  }

  handleModalClose() {
    this.setState({ isVideoModalOpen: false, currentVideo: null })
  }


}

ArticleMediaSearchResults.propTypes = {
  currentTab: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
  fetchImagesFromWikimediaCommonsState: PropTypes.string,
  fetchGifsFromWikimediaCommonsState: PropTypes.string,
  fetchVideosFromWikimediaCommonsState: PropTypes.string,
  searchImages: PropTypes.array,
  searchGifs: PropTypes.array,
  searchVideos: PropTypes.array,
}

const mapStateToProps = (state) =>
  Object.assign({}, state.article)
export default connect(mapStateToProps)(ArticleMediaSearchResults)
