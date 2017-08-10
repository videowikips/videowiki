import React, { Component, PropTypes } from 'react'
import { Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { Button, Modal, Icon } from 'semantic-ui-react'
import StateRenderer from '../common/StateRenderer'

import actions from '../../actions/WikiActionCreators'

class Page extends Component {
  constructor (props) {
    super(props)

    this.state = {
      shouldRender: false,
      shouldShowError: true,
    }

    this.handleClose = this.handleClose.bind(this)
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

    if (this.props.convertState === 'loading' && nextProps.convertState === 'failed') {
      this.setState({
        shouldShowError: true,
      })
    }

    if (this.props.convertState === 'loading' && nextProps.convertState === 'done') {
      this.props.history.push(`/wiki/convert/${nextProps.match.params.title}`)
    }
  }

  handleClose () {
    this.setState({
      shouldShowError: false,
    })
  }

  _renderError () {
    const { convertError } = this.props
    return this.state.shouldShowError && convertError && convertError.response ? (
      <Modal
        open={true}
        onClose={this.handleClose}
        basic
        size="small"
      >
        <Modal.Content>
          <h3 className="c-editor-error-modal">{ convertError.response.text }</h3>
        </Modal.Content>
        <Modal.Actions>
          <Button color='green' onClick={this.handleClose} inverted>
            <Icon name='checkmark' /> Got it
          </Button>
        </Modal.Actions>
      </Modal>
    ) : null
  }

  _handleConvertToVideoWiki () {
    const { match, dispatch } = this.props
    const title = match.params.title
    console.log(1)
    dispatch(actions.convertWiki({ title }))
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
        { this._renderError() }
      </div>
    )
  }

  render () {
    const { wikiContentState } = this.props
    console.log(1)
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
  convertState: PropTypes.string,
  convertError: PropTypes.object,
}
