import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Grid } from 'semantic-ui-react'
import InfiniteScroll from 'react-infinite-scroller'

import ArticleCard from './ArticleCard'

import StateRenderer from '../common/StateRenderer'

import actions from '../../actions/ArticleActionCreators'

class AllArticles extends Component {
  componentWillMount () {
    this.props.dispatch(actions.fetchAllArticles())
  }

  _renderArticles () {
    const { allArticles } = this.props

    return allArticles.map((article) => {
      const { image, title, _id } = article
      const url = `/videowiki/${title}`
      return (
        <Grid.Column width={5} key={ _id }>
          <ArticleCard
            url= { url }
            image={ image }
            title={ title }
          />
        </Grid.Column>
      )
    })
  }

  _render () {
    return (
      <div className="c-app-card-layout">
        <h2 className="u-text-center">All Articles</h2>
        <Grid>
          { this._renderArticles() }
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
  allArticles: PropTypes.array,
}

const mapStateToProps = (state) =>
  Object.assign({}, state.article)

export default connect(mapStateToProps)(AllArticles)
