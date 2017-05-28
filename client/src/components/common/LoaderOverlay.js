import React, { Component, PropTypes } from 'react'
import { Loader, Dimmer } from 'semantic-ui-react'

export default class LoaderOverlay extends Component {
  render () {
    return (
      <Dimmer active inverted>
        <Loader size="large" active inverted>{this.props.children}</Loader>
      </Dimmer>
    )
  }
}

LoaderOverlay.propTypes = {
  children: PropTypes.node,
}
