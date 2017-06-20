import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Grid } from 'semantic-ui-react'

import ArticleCard from './ArticleCard'

import StateRenderer from '../common/StateRenderer'

import actions from '../../actions/ArticleActionCreators'

class AllArticles extends Component {
  constructor (props) {
    super(props)

    this.state = {
      offset: 0,
    }

    this._loadArticles = this._loadArticles.bind(this)
  }

  componentWillMount () {
    const { offset } = this.state
    this.props.dispatch(actions.fetchAllArticles({ offset }))
  }

  _loadArticles () {
    console.log('hello')
    this.setState({
      offset: this.state.offset + 10,
    })
    const { offset } = this.state
    this.props.dispatch(actions.fetchAllArticles({ offset: offset + 10 }))
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

  _hasMore () {
    return this.props.deltaArticles.length > 0
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
  deltaArticles: PropTypes.array,
}

const mapStateToProps = (state) =>
  Object.assign({}, state.article)

export default connect(mapStateToProps)(AllArticles)
