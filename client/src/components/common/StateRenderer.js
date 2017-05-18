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
        return (
          <LoaderOverlay>{ loaderMessage }</LoaderOverlay>
        )
      case 'failed':
        return (
          <Message color="red" size="massive">{ errorMessage }</Message>
        )
    }
  }
}

StateRenderer.propTypes = {
  componentState: PropTypes.string.isRequired,
  loaderMessage: PropTypes.string.isRequired,
  errorMessage: PropTypes.string.isRequired,
  onRender: PropTypes.func.isRequired,
}
