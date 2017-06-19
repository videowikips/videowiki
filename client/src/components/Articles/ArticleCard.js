import React, { Component, PropTypes } from 'react'
import { Card, Image } from 'semantic-ui-react'
import { Link } from 'react-router-dom'

export default class ArticleCard extends Component {
  render () {
    const { url, image, title } = this.props

    return (
      <Link to={ url }>
        <Card className="c-app-card">
          <Image src={ image } />
          <Card.Content>
            <Card.Header>{ title.split('_').join(' ') }</Card.Header>
          </Card.Content>
        </Card>
      </Link>
    )
  }
}

ArticleCard.propTypes = {
  url: PropTypes.string,
  image: PropTypes.string,
  title: PropTypes.string,
}
