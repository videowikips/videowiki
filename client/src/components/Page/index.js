import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Loader, Dimmer } from 'semantic-ui-react'

import actions from '../../actions/WikiActionCreators'

class Page extends Component {
  componentWillMount () {
    const { dispatch, match } = this.props
    dispatch(actions.fetchWikiPage({ title: match.params.title }))
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.match.url !== nextProps.match.url) {
      nextProps.dispatch(actions.fetchWikiPage({ title: nextProps.match.params.title }))
    }
  }

  _render () {
    const { wikiContent } = this.props
    return (
      <div>
        <div dangerouslySetInnerHTML={{ __html: wikiContent }} />
      </div>
    )
  }

  _renderLoading () {
    return (
      <Dimmer active inverted>
        <Loader size="large" active inverted>Hold tight! Loading wiki content...</Loader>
      </Dimmer>
    )
  }

  _renderFailed () {
    return (
      <div>Failed...</div>
    )
  }

  render () {
    const { wikiContentState } = this.props
    switch (wikiContentState) {
      case 'done':
        return this._render()
      case 'loading':
        return this._renderLoading()
      case 'failed':
        return this._renderFailed()
    }
  }
}

const mapStateToProps = (state) =>
  Object.assign({}, state.wiki)

export default connect(mapStateToProps)(Page)

Page.propTypes = {
  dispatch: PropTypes.func.isRequired,
  match: PropTypes.object,
  wikiContent: PropTypes.string,
  wikiContentState: PropTypes.string.isRequired,
}
