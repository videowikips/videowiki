import React, { Component, PropTypes } from 'react'

import Editor from '../Editor'

class Viewer extends Component {
  render () {
    const { match } = this.props
    return (
      <Editor
        mode="viewer"
        match={match}
      />
    )
  }
}

Viewer.propTypes = {
  match: PropTypes.object.isRequired,
}

export default Viewer
