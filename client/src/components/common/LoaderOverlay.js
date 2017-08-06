import React, { Component, PropTypes } from 'react'
import { Loader, Dimmer, Image } from 'semantic-ui-react'

export default class LoaderOverlay extends Component {
  render () {
    return this.props.loaderImage ? (
      <Dimmer active inverted>
        <Image src={this.props.loaderImage} size="small" />
        <h3>{this.props.children}</h3>
      </Dimmer>
    ) : (
      <Dimmer active inverted>
        <Loader size="large" active inverted>{this.props.children}</Loader>
      </Dimmer>
    )
  }
}

LoaderOverlay.propTypes = {
  children: PropTypes.node,
  loaderImage: PropTypes.string,
}
