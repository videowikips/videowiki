import _ from 'lodash'
import request from '../../utils/requestAgent';
import React, { Component, PropTypes } from 'react'
import { withRouter, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import DocumentMeta from 'react-document-meta';
import { Sidebar, Segment, Progress, Modal, Button, Icon } from 'semantic-ui-react'
import classnames from 'classnames'
import queryString from 'query-string';

import EditorSidebar from './EditorSidebar'
import EditorFooter from './EditorFooter'
import EditorSlide from './EditorSlide'
import EditorHeader from './EditorHeader'

import LoaderOverlay from '../common/LoaderOverlay'

import articleActions from '../../actions/ArticleActionCreators'

import Viewer from './Viewer'
import EditorReferences from './EditorReferences';
import { NotificationManager } from 'react-notifications';
import EditorTimeline from './EditorTimeline';

class Editor extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currentSlideIndex: 0,
      isPlaying: props.autoPlay,
      showTextTransition: true,
      sidebarVisible: props.mode === 'editor' || (props.mode === 'viewer' && props.viewerMode === 'editor'),
      showDescription: props.mode === 'editor' || (props.mode === 'viewer' && props.viewerMode === 'editor'),
      audioLoaded: false,
      modalOpen: false,
      currentSubmediaIndex: 0,
      defaultSlideStartTime: 0,
    }

    this.handleClose = this.handleClose.bind(this)
    this.resetUploadState = this.resetUploadState.bind(this)
  }

  componentWillReceiveProps(nextProps) {
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
      const title = this.props.match.params.title;
      const { wikiSource } = queryString.parse(location.search);
      return this.props.history.push(`/${this.props.language}/videowiki/${title}?wikiSource=${wikiSource}&notification=false`)
    }
    // If the isPlaying changes from the props, change in the state too
    if (this.props.isPlaying !== nextProps.isPlaying) {
      if (nextProps.isPlaying) {
        const oldIndex = this.state.currentSlideIndex;
        let tempIndex;
        if (oldIndex === 0) {
          tempIndex = 1;
        } else {
          tempIndex = oldIndex - 1;
        }
        this.setState({
          isPlaying: false,
          currentSlideIndex: tempIndex,
          showTextTransition: false,
        }, () => {
          setTimeout(() => {
            this.setState({ isPlaying: true, currentSlideIndex: oldIndex, showTextTransition: true });
          }, 50);
        })
      } else {
        this.setState({ isPlaying: nextProps.isPlaying });
      }
    }
    if (this.props.controlled && nextProps.currentSlideIndex !== this.state.currentSlideIndex) {
      this._handleNavigateToSlide(nextProps.currentSlideIndex);
    }
    // check for viewerMode update
    if (this.props.viewerMode !== nextProps.viewerMode) {
      if (nextProps.viewerMode === 'editor') {
        this.setState({ showDescription: true, sidebarVisible: true });
      } else {
        this.setState({ showDescription: false, sidebarVisible: false });
      }
    }
  }

  _getTableOfContents() {
    const { article: { sections } } = this.props

    return sections.map((section) =>
      _.pick(section, ['title', 'toclevel', 'tocnumber', 'index', 'slideStartPosition', 'numSlides']),
    )
  }

  resetUploadState() {
    this.props.dispatch(articleActions.resetUploadState())
  }

  onSpeedChange(playbackSpeed) {
    this.props.dispatch(articleActions.setPlaybackSpeed({ playbackSpeed }))
  }

  _handleTogglePlay() {
    this.setState({
      isPlaying: !this.state.isPlaying,
    }, () => {
      if (this.state.isPlaying) {
        this.props.onPlay();
      }
    })
  }

  _handleNavigateToSlide(slideIndex) {
    const { article } = this.props
    const { slides } = article

    const index = slideIndex < 0 ? 0
      : slideIndex >= slides.length ? (slides.length - 1)
        : slideIndex

    this.setState({
      currentSlideIndex: index,
      audioLoaded: false,
      defaultSlideStartTime: 0,
      currentSubmediaIndex: 0,
    }, () => {
      this.props.onSlideChange(index);
    })
  }

  _handleSlideBack() {
    const { currentSlideIndex } = this.state
    if (currentSlideIndex > 0) {
      this.setState({
        currentSlideIndex: currentSlideIndex - 1,
        currentSubmediaIndex: 0,
        defaultSlideStartTime: 0,
        audioLoaded: false,
      }, () => {
        this.props.onSlideChange(currentSlideIndex - 1);
      });
    }
  }

  _handleSlideForward() {
    const { currentSlideIndex } = this.state

    const { article } = this.props
    const { slides } = article

    if (currentSlideIndex < slides.length - 1) {
      this.setState({
        currentSlideIndex: currentSlideIndex + 1,
        currentSubmediaIndex: 0,
        defaultSlideStartTime: 0,
        audioLoaded: false,
      }, () => {
        this.props.onSlideChange(currentSlideIndex + 1);
      })
    } else {
      this.props.onPlayComplete();
    }
  }

  _toggleSidebar() {
    this.setState({
      sidebarVisible: !this.state.sidebarVisible,
    })
  }

  _uploadContent(data, url, mimetype) {
    const { currentSlideIndex } = this.state
    const { dispatch, match } = this.props
    const { wikiSource } = queryString.parse(location.search)
    if (data) {
      // dispatch(articleActions.uploadContent({
      //   title: match.params.title,
      //   slideNumber: currentSlideIndex,
      //   file,
      // }))
      dispatch(articleActions.uploadContentRequest())

      const uploadRequest = request
        .post('/api/wiki/article/upload')
        .field('title', match.params.title)
        .field('wikiSource', wikiSource)
        .field('slideNumber', currentSlideIndex)

      // attach given fields in the request
      Object.keys(data).forEach((key) => {
        uploadRequest.field(key, data[key])
      })

      // finally attach the file to the form
      uploadRequest
        .attach('file', data.file)
        .on('progress', (event) => {
          dispatch(articleActions.updateProgress({ progress: event.percent }))
        })
        .end((err, { body }) => {
          if (err) {
            dispatch(articleActions.uploadContentFailed())
          } else {
            NotificationManager.success("Success! Don't forget to click on the publish icon to save your changes", '', 3000);
          }
          dispatch(articleActions.uploadContentReceive({ uploadStatus: body }))
        })
    } else {
      dispatch(articleActions.uploadImageUrl({
        title: match.params.title,
        wikiSource,
        slideNumber: currentSlideIndex,
        url,
        mimetype,
      }))
      NotificationManager.success("Success! Don't forget to click on the publish icon to save your changes", '', 3000)
    }
  }

  _publishArticle() {
    if (this.props.customPublish && this.props.onPublish) {
      return this.props.onPublish();
    }

    const { dispatch, match } = this.props
    const { wikiSource } = queryString.parse(location.search);
    const title = match.params.title

    dispatch(articleActions.publishArticle({ title, wikiSource }))
  }

  _renderLoading() {
    return this.props.publishArticleState === 'loading' ? (
      <LoaderOverlay loaderImage="/img/publish-loader.gif">
        Updating your contribution to the sum of all human knowledge
      </LoaderOverlay>
    ) : null
  }

  _handleMessageDismiss() {
    this.props.dispatch(articleActions.resetPublishError())
  }

  onDurationsChange(slide, durations) {
    const { title, wikiSource } = this.props.article;
    this.props.dispatch(articleActions.updateSlideMediaDurations({ title, wikiSource, slideNumber: slide.position, durations }))
  }

  handleClose() {
    const { history, match, dispatch } = this.props
    const { wikiSource } = queryString.parse(location.search);
    const title = match.params.title
    dispatch(articleActions.resetPublishError())

    return history.push(`/videowiki/${title}?wikiSource=${wikiSource}`)
  }

  _handleTimelineSeekEnd(defaultSlideStartTime) {
    console.log('seek end', defaultSlideStartTime, this.state.currentSlideIndex);
    this.setState({ defaultSlideStartTime: defaultSlideStartTime * 1000 });
  }

  _renderError() {
    const { publishArticleError } = this.props
    return publishArticleError && publishArticleError.response ? (
      <Modal
        open={true}
        onClose={this.handleClose}
        basic
        size="small"
      >
        <Modal.Content>
          <h3 className="c-editor-error-modal">{publishArticleError.response.text}</h3>
        </Modal.Content>
        <Modal.Actions>
          <Button color="green" onClick={this.handleClose} inverted>
            <Icon name="checkmark" /> Got it
          </Button>
        </Modal.Actions>
      </Modal>
    ) : null
  }

  _renderPublished() {
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

  _renderEditorSlide() {
    const { article, mode, uploadState, uploadStatus, uploadProgress, auth, muted } = this.props
    const { wikiSource } = queryString.parse(location.search)
    const { slides } = article

    const { currentSlideIndex, isPlaying } = this.state

    const currentSlide = slides[currentSlideIndex]

    const { text, audio, media, mediaType } = currentSlide

    return (
      <EditorSlide
        articleId={article._id}
        title={article.title}
        wikiSource={wikiSource}
        currentSlideIndex={currentSlideIndex}
        editable={this.props.editable}
        showTextTransition={this.state.showTextTransition}
        showDescription={this.state.showDescription}
        description={text}
        audio={audio}
        muted={muted}
        media={media}
        mediaType={mediaType}
        onSlidePlayComplete={() => this._handleSlideForward()}
        isPlaying={isPlaying}
        uploadContent={(data, url, mimetype) => this._uploadContent(data, url, mimetype)}
        mode={mode}
        uploadState={uploadState}
        uploadStatus={uploadStatus}
        uploadProgress={uploadProgress}
        resetUploadState={this.resetUploadState}
        playbackSpeed={this.props.playbackSpeed}
        isLoggedIn={(auth.session && auth.session.user) || false}
      />
    )
  }

  _renderViewer() {
    const { article } = this.props
    const { slidesHtml, slides } = article
    const { currentSlideIndex, isPlaying } = this.state

    let renderedSlides = slides;
    // check if slidesHtml is available
    if (slidesHtml && slidesHtml.length > 0 && slidesHtml.length === slides.length) {
      renderedSlides = slidesHtml
    }
    return (
      <Viewer
        slides={renderedSlides}
        muted={this.props.muted}
        showDescription={this.state.showDescription}
        currentSlideIndex={currentSlideIndex}
        isPlaying={isPlaying && this.state.audioLoaded}
        currentSubmediaIndex={this.state.currentSubmediaIndex}
        defaultSlideStartTime={this.state.defaultSlideStartTime}
        onSlidePlayComplete={() => this._handleSlideForward()}
        onAudioLoad={() => this.setState({ audioLoaded: true })}
        playbackSpeed={this.props.playbackSpeed}
        onSubMediaSlideChange={(currentSubmediaIndex) => this.setState({ currentSubmediaIndex })}
      />
    )
  }

  _renderSlide() {
    return this.props.mode === 'viewer' ? this._renderViewer()
      : this._renderEditorSlide()
  }

  _render() {
    const { article, match, mode, uploadState, language } = this.props
    const title = match.params.title

    if (!article) {
      let redirectStr = `/${this.props.language}/wiki/${title}`;
      const { wikiSource } = queryString.parse(location.search);
      if (wikiSource) {
        redirectStr += `?wikiSource=${wikiSource}`;
      }
      // redirect to convert page
      return <Redirect to={redirectStr} />;
    }

    const { slides } = article
    const updatedAt = article.updated_at

    const { currentSlideIndex, sidebarVisible } = this.state
    const currentSlide = slides[currentSlideIndex] || {};

    const mainContentClasses = classnames('c-main-content', {
      'c-main-content__sidebar-visible': sidebarVisible,
      'c-main-content__sidebar-visible--viewer': sidebarVisible && mode === 'viewer',
    })

    const editorClasses = classnames('c-editor', {
      'c-editor__editor': mode !== 'viewer',
      'c-editor__viewer': mode === 'viewer',
    })

    const hideSidebarToggle = mode !== 'viewer'

    // Meta tags for SEO
    const pageTitle = `VideoWiki: ${this.props.article && this.props.article.title.split('_').join(' ')}`;
    const pageDesc = `Checkout the new VideoWiki article at ${location.href}`;

    const metaTags = {
      title: pageTitle,
      description: pageDesc,
      canonical: location.href,
      meta: {
        charSet: 'utf-8',
        itemProp: {
          name: pageTitle,
          description: pageDesc,
          image: this.props.article && this.props.article.image,
        },
        property: {
          'og:url': location.href,
          'og:title': pageTitle,
          'og:type': 'article',
          'og:image': this.props.article && this.props.article.image,
          'og:site_name': 'Videowiki',
          'twitter:site': '@videowiki',
          'twitter:title': pageTitle,
        },
      },
      auto: {
        ograph: true,
      },
    }

    return (
      <DocumentMeta {...metaTags} >
        <div>
          <div className={editorClasses}>
            {/* Header */}
            <EditorHeader
              article={article}
              language={language}
              showOptions={this.props.showOptions}
              authenticated={this.props.auth.session && this.props.auth.session.user}
              currentSlide={currentSlide || {}}
              mode={mode}
              showPublish={this.props.showPublish}
              articleVideo={this.props.articleVideo}
              articleLastVideo={this.props.articleLastVideo}
              fetchArticleVideoState={this.props.fetchArticleVideoState}
              onPublishArticle={() => this._publishArticle()}
              onPausePlay={() => this.setState({ isPlaying: false })}
              viewerMode={this.props.viewerMode}
              onViewerModeChange={(e, { value }) => this.props.onViewerModeChange(value)}
              onBack={() => this.props.history.push(`/${this.props.language}/videowiki/${this.props.article.title}?wikiSource=${this.props.article.wikiSource}`)}
            />

            {/* Main */}
            <div className="c-editor__content">
              <Sidebar.Pushable as={Segment} className="c-editor__content--all">
                <EditorSidebar
                  toc={this._getTableOfContents()}
                  visible={sidebarVisible}
                  currentSlideIndex={currentSlideIndex}
                  navigateToSlide={(slideStartPosition) => this._handleNavigateToSlide(slideStartPosition)}
                />
                <Sidebar.Pusher className={mainContentClasses}>
                  {this._renderSlide()}
                </Sidebar.Pusher>
              </Sidebar.Pushable>
              <Progress color="blue" value={currentSlideIndex + 1} total={slides.length} attached="bottom" />
            </div>

            {/* Footer */}
            <EditorFooter
              currentSlideIndex={currentSlideIndex}
              totalSlideCount={slides.length}
              uploadState={uploadState}
              onSlideBack={() => this._handleSlideBack()}
              togglePlay={() => this._handleTogglePlay()}
              onCCToggle={() => this.setState({ showDescription: !this.state.showDescription })}
              onSlideForward={() => this._handleSlideForward()}
              isPlaying={this.state.isPlaying}
              toggleSidebar={() => this._toggleSidebar()}
              title={title}
              hideSidebarToggle={hideSidebarToggle}
              onSpeedChange={(value) => this.onSpeedChange(value)}
              updatedAt={updatedAt}
            />
          </div>
          { this.props.viewerMode === 'editor' && currentSlide && currentSlide.media && currentSlide.media.length > 0 && (
            <EditorTimeline
              onDurationsChange={this.onDurationsChange.bind(this)}
              currentSlide={currentSlide}
              currentSlideIndex={currentSlideIndex}
              isPlaying={this.state.isPlaying}
              onAudioLoad={() => this.setState({ audioLoaded: true })}
              onPlayComplete={() => this._handleSlideForward()}
              onSeekEnd={this._handleTimelineSeekEnd.bind(this)}
            />
          )}
          {this.props.showReferences && (
            <EditorReferences
              mode={mode}
              article={article}
              currentSlideIndex={currentSlideIndex}
              currentSlide={currentSlide}
              currentSubmediaIndex={this.state.currentSubmediaIndex}
              language={this.props.language}
            />
          )}
        </div>
      </DocumentMeta>
    )
  }

  _renderEditor() {
    return this.props.mode === 'viewer' ? this._render()
      : this._renderPublished()
  }

  render() {
    return this._renderEditor();
  }
}

const mapStateToProps = ({ auth, article, ui }) =>
  ({ auth, playbackSpeed: article.playbackSpeed, uploadState: article.uploadState, language: ui.language })

export default withRouter(connect(mapStateToProps)(Editor))

Editor.defaultProps = {
  isLoggedIn: false,
  autoPlay: false,
  showOptions: false,
  showReferences: false,
  editable: false,
  isPlaying: false,
  articleVideo: {
    video: {},
    exported: 'false',
  },
  articleLastVideo: {},
  onSlideChange: () => {},
  onPublish: () => {},
  onPlayComplete: () => {},
  onPlay: () => {},
  onViewerModeChange: () => {},
  showPublish: false,
  customPublish: false,
  muted: false,
  currentSlideIndex: 0,
  controlled: false,
  viewerMode: 'player',
}

Editor.propTypes = {
  dispatch: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
  article: PropTypes.object,
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
  language: PropTypes.string.isRequired,
  auth: PropTypes.any,
  autoPlay: PropTypes.bool,
  showOptions: PropTypes.bool,
  showReferences: PropTypes.bool,
  editable: PropTypes.bool,
  isPlaying: PropTypes.bool,
  fetchArticleVideoState: PropTypes.string,
  articleVideo: PropTypes.object,
  articleLastVideo: PropTypes.object,
  onSlideChange: PropTypes.func,
  customPublish: PropTypes.bool,
  onPublish: PropTypes.func,
  showPublish: PropTypes.bool,
  muted: PropTypes.bool,
  currentSlideIndex: PropTypes.number,
  onPlayComplete: PropTypes.func,
  onPlay: PropTypes.func,
  controlled: PropTypes.bool,
  onViewerModeChange: PropTypes.func,
  viewerMode: PropTypes.string,
}
