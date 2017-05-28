import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import actions from '../../actions/WikiActionCreators'

class WikiProgress extends Component {
  componentWillMount () {
    const { match, dispatch } = this.props
    dispatch(actions.convertWiki({ title: match.params.title }))
  }

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
