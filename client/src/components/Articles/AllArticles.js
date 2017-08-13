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
    this.props.dispatch(actions.fetchAllArticles({ offset }))
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
        this.props.dispatch(actions.fetchDeltaArticles({ offset: this.state.offset }))
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
    const { allArticles } = this.props

    return allArticles.map((article) => {
      const { image, title, _id } = article
      const url = `/videowiki/${title}`
      return (
        <Grid.Column width={4} key={ _id } style={{margin: '1rem 0'}}>
          <ArticleCard
            url= { url }
            image={ image }
            title={ title }
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
}

const mapStateToProps = (state) =>
  Object.assign({}, state.article)

export default connect(mapStateToProps)(AllArticles)
