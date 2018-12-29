import React, { Component, PropTypes } from 'react'
import { Card, Image } from 'semantic-ui-react'
import { Link } from 'react-router-dom'

export default class ArticleCard extends Component {
  render () {
    const { url, image, title, className, ns } = this.props
    const appClassName = className || 'c-app-card'
    const articleTitle = title.split('/').pop().split('_').join(' ');

    return (
      <Link to={ url }>
        <Card className={ appClassName } style={{position: 'relative'}} >
          {ns !== 0 && (
            <div className="custom" >Custom</div>
          )}
          <Image src={ image } />
          <Card.Content>
            <Card.Header>{ articleTitle }</Card.Header>
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
  className: PropTypes.string,
  ns: PropTypes.number,
}

ArticleCard.defaultProps = {
  ns: 0,
}
