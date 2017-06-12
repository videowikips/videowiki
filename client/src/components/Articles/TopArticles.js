import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Card, Image, Grid } from 'semantic-ui-react'
import { Link } from 'react-router-dom'

import StateRenderer from '../common/StateRenderer'

import actions from '../../actions/ArticleActionCreators'

class TopArticles extends Component {
  componentWillMount () {
    this.props.dispatch(actions.fetchTopArticles())
  }

  _renderArticles () {
    const { topArticles } = this.props

    return topArticles.map((article) => {
      const { image, title, _id } = article
      const url = `/videowiki/${title}`
      return (
        <Grid.Column width={5} key={ _id }>
          <Link to={ url }>
            <Card className="c-app-card">
              <Image src={ image } />
              <Card.Content>
                <Card.Header>{ title.split('_').join(' ') }</Card.Header>
              </Card.Content>
            </Card>
          </Link>
        </Grid.Column>
      )
    })
  }

  _render () {
    return (
      <div className="c-app-card-layout">
        <Grid>
          <Grid.Row>
            { this._renderArticles() }
          </Grid.Row>
        </Grid>
      </div>
    )
  }

  render () {
    const { topArticlesState } = this.props
    return (
      <StateRenderer
        componentState={topArticlesState}
        loaderMessage="Hold Tight! Loading top articles..."
        errorMessage="Error while loading articles! Please try again later!"
        onRender={() => this._render()}
      />
    )
  }
}

TopArticles.propTypes = {
  dispatch: PropTypes.func.isRequired,
  topArticlesState: PropTypes.string.isRequired,
  topArticles: PropTypes.array.isRequired,
}

const mapStateToProps = (state) =>
  Object.assign({}, state.article)

export default connect(mapStateToProps)(TopArticles)
