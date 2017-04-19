import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import actions from '../../actions/WikiActionCreators'

class Page extends Component {
  componentWillMount () {
    const { dispatch, match } = this.props
    dispatch(actions.fetchWikiPage({ title: match.params.title }))
  }

  render () {
    const { wikiContent } = this.props
    return (
      <div>
        <div dangerouslySetInnerHTML={{ __html: wikiContent }} />
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  console.log(state)
  return Object.assign({}, state.wiki)
}
export default connect(mapStateToProps)(Page)

Page.propTypes = {
  dispatch: PropTypes.func.isRequired,
  match: PropTypes.object,
  wikiContent: PropTypes.string,
}
