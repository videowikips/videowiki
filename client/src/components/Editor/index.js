import _ from 'lodash'
import request from 'superagent'
import React, { Component, PropTypes } from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Sidebar, Segment, Progress, Dimmer, Loader, Modal, Button, Icon } from 'semantic-ui-react'
import classnames from 'classnames'

import EditorSidebar from './EditorSidebar'
import EditorFooter from './EditorFooter'
import EditorSlide from './EditorSlide'
import EditorHeader from './EditorHeader'

import LoaderOverlay from '../common/LoaderOverlay'

import StateRenderer from '../common/StateRenderer'

import articleActions from '../../actions/ArticleActionCreators'

class Editor extends Component {
  constructor (props) {
    super(props)
    this.state = {
      currentSlideIndex: 0,
      isPlaying: true,
      sidebarVisible: true,
      modalOpen: false,
    }

    this.handleClose = this.handleClose.bind(this)
    this.resetUploadState = this.resetUploadState.bind(this)
  }

  componentWillMount () {
    const { dispatch, match, mode } = this.props
    dispatch(articleActions.fetchArticle({ title: match.params.title, mode }))
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.uploadState === 'loading' && nextProps.uploadState === 'done') {
      const { article, uploadStatus } = nextProps
      const { slideNumber, mimetype, filepath } = uploadStatus

      const updatedArticle = Object.assign({}, article)
      updatedArticle['slides'][slideNumber]['mediaType'] = mimetype
      updatedArticle['slides'][slideNumber]['media'] = filepath

      this.props.dispatch(articleActions.updateArticle({ article }))
    }

    if (this.props.publishArticleState === 'loading' && nextProps.publishArticleState === 'done') {
      // redirect to viewer
      const title = this.props.match.params.title
      return this.props.history.push(`/videowiki/${title}`)
    }
  }

  _getTableOfContents () {
    const { article: { sections } } = this.props

    return sections.map((section) =>
      _.pick(section, ['title', 'toclevel', 'tocnumber', 'index', 'slideStartPosition', 'numSlides']),
    )
  }

  resetUploadState () {
    this.props.dispatch(articleActions.resetUploadState())
  }

  onSpeedChange (playbackSpeed) {
    this.props.dispatch(articleActions.setPlaybackSpeed({ playbackSpeed }))
  }

  _handleTogglePlay () {
    this.setState({
      isPlaying: !this.state.isPlaying,
    })
  }

  _handleNavigateToSlide (slideIndex) {
    const { article } = this.props
    const { slides } = article

    const index = slideIndex < 0 ? 0
      : slideIndex >= slides.length ? (slides.length - 1)
      : slideIndex

    this.setState({
      currentSlideIndex: index,
    })
  }

  _handleSlideBack () {
    const { currentSlideIndex } = this.state
    if (currentSlideIndex > 0) {
      this.setState({
        currentSlideIndex: currentSlideIndex - 1,
      })
    }
  }

  _handleSlideForward () {
    const { currentSlideIndex } = this.state

    const { article } = this.props
    const { slides } = article

    if (currentSlideIndex < slides.length - 1) {
      this.setState({
        currentSlideIndex: currentSlideIndex + 1,
      })
    }
  }

  _toggleSidebar () {
    this.setState({
      sidebarVisible: !this.state.sidebarVisible,
    })
  }

  _uploadContent (file, url) {
    const { currentSlideIndex } = this.state
    const { dispatch, match } = this.props

    if (file) {
      // dispatch(articleActions.uploadContent({
      //   title: match.params.title,
      //   slideNumber: currentSlideIndex,
      //   file,
      // }))
      dispatch(articleActions.uploadContentRequest())

      request
        .post('/api/wiki/article/upload')
        .field('title', match.params.title)
        .field('slideNumber', currentSlideIndex)
        .attach('file', file)
        .on('progress', (event) => {
          dispatch(articleActions.updateProgress({ progress: event.percent }))
        })
        .end((err, { body }) => {
          if (err) {
            dispatch(articleActions.uploadContentFailed())
          }
          dispatch(articleActions.uploadContentReceive({ uploadStatus: body }))
        })
    } else {
      dispatch(articleActions.uploadImageUrl({
        title: match.params.title,
        slideNumber: currentSlideIndex,
        url,
      }))
    }
  }

  _publishArticle () {
    const { dispatch, match } = this.props
    const title = match.params.title

    dispatch(articleActions.publishArticle({ title }))
  }

  _renderLoading () {
    return this.props.publishArticleState === 'loading' ? (
      <LoaderOverlay loaderImage="/img/publish-loader.gif">
        Updating your contribution to the sum of all human knowledge
      </LoaderOverlay>
    ) : null
  }

  _handleMessageDismiss () {
    this.props.dispatch(articleActions.resetPublishError())
  }

  handleClose () {
    const { history, match, dispatch } = this.props
    const title = match.params.title
    dispatch(articleActions.resetPublishError())

    return history.push(`/videowiki/${title}`)
  }

  _renderError () {
    const { publishArticleError } = this.props
    return publishArticleError && publishArticleError.response ? (
      <Modal
        open={true}
        onClose={this.handleClose}
        basic
        size="small"
      >
        <Modal.Content>
          <h3 className="c-editor-error-modal">{ publishArticleError.response.text }</h3>
        </Modal.Content>
        <Modal.Actions>
          <Button color='green' onClick={this.handleClose} inverted>
            <Icon name='checkmark' /> Got it
          </Button>
        </Modal.Actions>
      </Modal>
    ) : null
  }

  _renderPublished () {
    const { publishArticleState, mode } = this.props

    if (mode !== 'viewer' &&
      publishArticleState) {
      switch (publishArticleState) {
        case 'done':
          return this._render()
        case 'loading':
          return this._renderLoading()
        case 'failed':
          return this._renderError()
        default:
          return this._render()
      }
    } else {
      return this._render()
    }
  }

  _render () {
    const { article, match, mode, uploadState, uploadStatus, uploadProgress } = this.props
    const title = match.params.title

    if (!article) {
      // redirect to convert page
      return this.props.history.push(`/wiki/${title}`)
    }

    const { slides } = article

    const { currentSlideIndex, isPlaying, sidebarVisible } = this.state

    const currentSlide = slides[currentSlideIndex]

    const { text, audio, media, mediaType } = currentSlide

    const mainContentClasses = classnames('c-main-content', {
      'c-main-content__sidebar-visible': sidebarVisible,
    })

    const hideSidebarToggle = mode !== 'viewer'

    return (
      <div className="c-editor">
        {/* Header */}
        <EditorHeader
          article={article}
          mode={ mode }
          onPublishArticle={ () => this._publishArticle() }
        />

        {/* Main */}
        <div className="c-editor__content">
          <Sidebar.Pushable as={Segment} className="c-editor__content--all">
            <EditorSidebar
              toc={ this._getTableOfContents() }
              visible={ sidebarVisible }
              currentSlideIndex={ currentSlideIndex }
              navigateToSlide={ (slideStartPosition) => this._handleNavigateToSlide(slideStartPosition) }
            />
            <Sidebar.Pusher className={ mainContentClasses }>
              <EditorSlide
                description={ text }
                audio={ audio }
                media={ media }
                mediaType={ mediaType }
                onSlidePlayComplete={ () => this._handleSlideForward() }
                isPlaying={ isPlaying }
                uploadContent={ (file, url) => this._uploadContent(file, url) }
                mode={ mode }
                uploadState={ uploadState }
                uploadStatus={ uploadStatus }
                uploadProgress={uploadProgress}
                resetUploadState={this.resetUploadState}
                playbackSpeed={this.props.playbackSpeed}
              />
            </Sidebar.Pusher>
          </Sidebar.Pushable>
          <Progress color="blue" value={ currentSlideIndex + 1 } total={ slides.length } attached="bottom" />
        </div>

        {/* Footer */}
        <EditorFooter
          currentSlideIndex={ currentSlideIndex }
          totalSlideCount={ slides.length }
          onSlideBack={ () => this._handleSlideBack() }
          togglePlay={ () => this._handleTogglePlay() }
          onSlideForward={ () => this._handleSlideForward() }
          isPlaying={ this.state.isPlaying }
          toggleSidebar={ () => this._toggleSidebar() }
          title={ title }
          hideSidebarToggle={ hideSidebarToggle }
          onSpeedChange={(value) => this.onSpeedChange(value)}
        />
      </div>
    )
  }

  _renderEditor () {
    return this.props.mode === 'viewer' ? this._render()
      : this._renderPublished()
  }

  render () {
    const { fetchArticleState } = this.props
    return this.props.mode === 'viewer' ? (
      <StateRenderer
        componentState={fetchArticleState}
        loaderImage="/img/view-loader.gif"
        loaderMessage="Loading your article from the sum of all human knowledge!"
        errorMessage="Error while loading article! Please try again later!"
        onRender={() => this._renderEditor()}
      />
    ) : (
      <StateRenderer
        componentState={fetchArticleState}
        loaderImage="/img/edit-loader.gif"
        loaderMessage="Editing the sum of all human knowledge!"
        errorMessage="Error while loading article! Please try again later!"
        onRender={() => this._renderEditor()}
      />
    )
  }
}

const mapStateToProps = (state) =>
  Object.assign({}, state.article)

export default withRouter(connect(mapStateToProps)(Editor))

Editor.propTypes = {
  dispatch: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
  article: PropTypes.object,
  fetchArticleState: PropTypes.string.isRequired,
  mode: PropTypes.string,
  history: React.PropTypes.shape({
    push: React.PropTypes.func.isRequired,
  }).isRequired,
  publishArticleState: PropTypes.string,
  publishArticleStatus: PropTypes.object,
  publishArticleError: PropTypes.object,
  uploadState: PropTypes.string,
  uploadStatus: PropTypes.object,
  uploadProgress: PropTypes.number,
  playbackSpeed: PropTypes.number.isRequired,
}
