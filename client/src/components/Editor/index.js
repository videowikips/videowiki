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
    }
  }

  componentWillMount () {
    const { dispatch, match } = this.props
    dispatch(articleActions.fetchArticle({ title: match.params.title }))
  }

  _getTableOfContents () {
    const { article: { content } } = this.props

    return content.map((section) =>
      _.pick(section, ['title', 'toclevel', 'tocnumber', 'index']),
    )
  }

  _getAllSlides () {
    const { article: { content } } = this.props
    let allSlides = []

    content.forEach((section) => {
      allSlides = allSlides.concat(section.slides)
    })

    return allSlides
  }

  _handlePlay () {

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
    const allSlides = this._getAllSlides()

    if (currentSlideIndex < allSlides.length - 1) {
      this.setState({
        currentSlideIndex: currentSlideIndex + 1,
      })
    }
  }

  _render () {
    const { article } = this.props
    const allSlides = this._getAllSlides()

    const { currentSlideIndex } = this.state

    const currentSlide = allSlides[currentSlideIndex]

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
            <EditorSidebar toc={ this._getTableOfContents() }/>
            <Sidebar.Pusher className="c-main-content">
              <EditorSlide
                description={ text }
                audio={ audio }
                media={ media }
                mediaType={ mediaType }
                onSlidePlayComplete={ () => this._handleSlideForward() }
              />
            </Sidebar.Pusher>
          </Sidebar.Pushable>
          <Progress color="blue" value={ currentSlideIndex + 1 } total={ allSlides.length } attached="bottom" />
        </div>

        {/* Footer */}
        <EditorFooter
          currentSlideIndex={ currentSlideIndex }
          totalSlideCount={ allSlides.length }
          onSlideBack={ () => this._handleSlideBack() }
          onPlay={ () => this._handlePlay() }
          onSlideForward={ () => this._handleSlideForward() }
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
