import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Grid, Loader } from 'semantic-ui-react'

import ArticleCard from './ArticleCard'

import StateRenderer from '../common/StateRenderer'

import actions from '../../actions/ArticleActionCreators'

class AllArticles extends Component {
  constructor (props) {
    super(props)

    this.state = {
      offset: 0,
    }

    //this._loadArticles = this._loadArticles.bind(this)
    this.handleOnScroll = this.handleOnScroll.bind(this)
  }

  componentWillMount () {
    const { offset } = this.state
    this.props.dispatch(actions.fetchAllArticles({ offset, wiki: this.props.wiki }))
  }

  componentDidMount () {
    window.addEventListener('scroll', this.handleOnScroll)
  }

  componentWillUnmount () {
    window.removeEventListener('scroll', this.handleOnScroll)
  }

  querySearchResult () {
    if (this.props.fetchAllArticlesState !== 'loading' && this._hasMore()) {
      this.setState({
        offset: this.state.offset + 10,
      }, () => {
        this.props.dispatch(actions.fetchDeltaArticles({ offset: this.state.offset, wiki: this.props.wiki }))
      })
    }
  }

  handleOnScroll () {
    // http://stackoverflow.com/questions/9439725/javascript-how-to-detect-if-browser-window-is-scrolled-to-bottom
    const scrollTop = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop
    const scrollHeight = (document.documentElement && document.documentElement.scrollHeight) || document.body.scrollHeight
    const clientHeight = document.documentElement.clientHeight || window.innerHeight
    const scrolledToBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight - 100

    if (scrolledToBottom) {
      this.querySearchResult()
    }
  }

  _renderArticles () {
    const { allArticles, language } = this.props

    return allArticles.map((article) => {
      const { title, _id, wikiSource, ns, thumbUrl } = article
      const url = `/${language}/videowiki/${title}?wikiSource=${wikiSource}`
      return (
        <Grid.Column computer={4} tablet={5} mobile={8} key={ _id } >
          <ArticleCard
            url= { url }
            image={ thumbUrl }
            title={ title }
            ns={ ns || 0 }
          />
        </Grid.Column>
      )
    })
  }

  _hasMore () {
    return this.props.deltaArticles.length === 10
  }

  _renderLoader () {
    return this.props.fetchDeltaArticlesState === 'loading' ? (
      <Loader size="large" active inverted></Loader>
    ) : null
  }

  _render () {
    return (
      <div className="c-app-card-layout">
        <h2 className="u-text-center">All Articles</h2>
        <Grid>
          { this._renderArticles() }
          { this._renderLoader() }
        </Grid>
      </div>
    )
  }

  render () {
    const { fetchAllArticlesState } = this.props
    return (
      <StateRenderer
        componentState={fetchAllArticlesState}
        loaderMessage="Hold Tight! Loading all articles..."
        errorMessage="Error while loading articles! Please try again later!"
        onRender={() => this._render()}
      />
    )
  }
}

AllArticles.propTypes = {
  dispatch: PropTypes.func.isRequired,
  fetchAllArticlesState: PropTypes.string,
  fetchDeltaArticlesState: PropTypes.string,
  allArticles: PropTypes.array,
  deltaArticles: PropTypes.array,
  language: PropTypes.string.isRequired,
  wiki: PropTypes.string,
}

const mapStateToProps = (state) =>
  Object.assign({}, { ...state.article, language: state.ui.language, wiki: state.ui.wiki })

export default connect(mapStateToProps)(AllArticles)
