import React, { Component, PropTypes } from 'react'
import { Message } from 'semantic-ui-react'

import LoaderOverlay from './LoaderOverlay'

export default class StateRenderer extends Component {
  render () {
    const { componentState, loaderMessage, errorMessage, onRender } = this.props
    switch (componentState) {
      case 'done':
        return onRender()
      case 'loading':
        return !this.props.loaderDisabled ? (
          <LoaderOverlay loaderImage={this.props.loaderImage}>
            { loaderMessage }
          </LoaderOverlay>
        ) : null
      case 'failed':
        return (
          <Message color="red" size="massive">{ errorMessage }</Message>
        )
      default:
        return !this.props.loaderDisabled ? (
          <LoaderOverlay loaderImage={this.props.loaderImage}></LoaderOverlay>
        ) : null
    }
  }
}

StateRenderer.propTypes = {
  componentState: PropTypes.string.isRequired,
  loaderImage: PropTypes.string,
  loaderDisabled: PropTypes.bool,
  loaderMessage: PropTypes.string.isRequired,
  errorMessage: PropTypes.string.isRequired,
  onRender: PropTypes.func.isRequired,
}
