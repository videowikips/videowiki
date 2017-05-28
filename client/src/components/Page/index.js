import React, { Component, PropTypes } from 'react'
import { Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { Button } from 'semantic-ui-react'
import StateRenderer from '../common/StateRenderer'

import actions from '../../actions/WikiActionCreators'

class Page extends Component {
  constructor (props) {
    super(props)

    this.state = {
      shouldRender: false,
    }
  }

  componentWillMount () {
    const { dispatch, match } = this.props
    dispatch(actions.fetchWikiPage({ title: match.params.title }))
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.wikiContentState === 'loading' && nextProps.wikiContentState === 'done') {
      this.setState({
        shouldRender: true,
      })
    }

    if (this.props.match.url !== nextProps.match.url) {
      nextProps.dispatch(actions.fetchWikiPage({ title: nextProps.match.params.title }))
    }
  }

  _handleConvertToVideoWiki () {
    const { match, history } = this.props
    history.push(`/wiki/convert/${match.params.title}`)
  }

  _renderConvertToVideoWikiButton () {
    return (
      <Button
        primary
        className="u-block-center u-display-block u-margin-bottom"
        onClick={() => this._handleConvertToVideoWiki()}
      >
        Convert this article to VideoWiki
      </Button>
    )
  }

  _render () {
    const { wikiContent } = this.props

    try {
      const parsedContent = JSON.parse(wikiContent)
      if (parsedContent.redirect && this.state.shouldRender) {
        return (
          <Redirect to={ parsedContent.path } />
        )
      }
    } catch (e) {}

    return (
      <div>
        { this._renderConvertToVideoWikiButton() }
        <div dangerouslySetInnerHTML={{ __html: wikiContent }} />
      </div>
    )
  }

  render () {
    const { wikiContentState } = this.props
    return (
      <StateRenderer
        componentState={wikiContentState}
        loaderMessage="Hold Tight! Loading wiki content..."
        errorMessage="Error while loading wiki content! Please try again later!"
        onRender={() => this._render()}
      />
    )
  }
}

const mapStateToProps = (state) =>
  Object.assign({}, state.wiki)

export default connect(mapStateToProps)(Page)

Page.propTypes = {
  dispatch: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
  wikiContent: PropTypes.string,
  wikiContentState: PropTypes.string.isRequired,
  history: PropTypes.object.isRequired,
}
