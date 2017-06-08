import _ from 'lodash'
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Button, Icon, Sidebar, Segment, Progress } from 'semantic-ui-react'

import EditorSidebar from './EditorSidebar'
import EditorFooter from './EditorFooter'
import EditorSlide from './EditorSlide'

import StateRenderer from '../common/StateRenderer'

import articleActions from '../../actions/ArticleActionCreators'

class Editor extends Component {
  constructor (props) {
    super(props)
    this.state = {
      currentSlideIndex: 0,
      isPlaying: true,
      sidebarVisible: true,
    }
  }

  componentWillMount () {
    const { dispatch, match } = this.props
    dispatch(articleActions.fetchArticle({ title: match.params.title }))
  }

  _getTableOfContents () {
    const { article: { sections } } = this.props

    return sections.map((section) =>
      _.pick(section, ['title', 'toclevel', 'tocnumber', 'index', 'slideStartPosition', 'numSlides']),
    )
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

  _uploadContent (file) {
    const { currentSlideIndex } = this.state
    const { dispatch, match } = this.props

    dispatch(articleActions.uploadContent({
      title: match.params.title,
      slideNumber: currentSlideIndex,
      file,
    }))
  }

  _render () {
    const { article } = this.props
    const { slides } = article

    const { currentSlideIndex, isPlaying, sidebarVisible } = this.state

    const currentSlide = slides[currentSlideIndex]

    const { text, audio, media, mediaType } = currentSlide

    return (
      <div className="c-editor">
        {/* Header */}
        <div className="c-editor__toolbar">
          <span className="c-editor__toolbar-title">{ article.title }</span>
          <Button basic icon className="c-editor__toolbar-publish">
            <Icon name="save" />
          </Button>
        </div>

        {/* Main */}
        <div className="c-editor__content">
          <Sidebar.Pushable as={Segment} className="c-editor__content--all">
            <EditorSidebar
              toc={ this._getTableOfContents() }
              visible={ sidebarVisible }
              currentSlideIndex={ currentSlideIndex }
              navigateToSlide={ (slideStartPosition) => this._handleNavigateToSlide(slideStartPosition) }
            />
            <Sidebar.Pusher className="c-main-content">
              <EditorSlide
                description={ text }
                audio={ audio }
                media={ media }
                mediaType={ mediaType }
                onSlidePlayComplete={ () => this._handleSlideForward() }
                isPlaying={ isPlaying }
                uploadContent={ (file) => this._uploadContent(file) }
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
        />
      </div>
    )
  }

  render () {
    const { fetchArticleState } = this.props
    return (
      <StateRenderer
        componentState={fetchArticleState}
        loaderMessage="Hold Tight! Loading article..."
        errorMessage="Error while loading article! Please try again later!"
        onRender={() => this._render()}
      />
    )
  }
}

const mapStateToProps = (state) =>
  Object.assign({}, state.article)

export default connect(mapStateToProps)(Editor)

Editor.propTypes = {
  dispatch: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
  article: PropTypes.object,
  fetchArticleState: PropTypes.string.isRequired,
}
