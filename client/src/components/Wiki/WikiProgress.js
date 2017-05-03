import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

class WikiProgress extends Component {
  render () {
    return (
      <div>Wiki Progress</div>
    )
  }
}

const mapStateToProps = (state) =>
  Object.assign({}, state.wikiProgress)

export default connect(mapStateToProps)(WikiProgress)

WikiProgress.propTypes = {
  dispatch: PropTypes.func.isRequired,
  match: PropTypes.object,
}
