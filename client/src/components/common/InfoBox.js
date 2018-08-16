import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import StateRenderer from './StateRenderer'

import actions from '../../actions/WikiActionCreators'

class InfoBox extends Component {
  componentWillMount () {
    const { title, titleWikiSource } = this.props

    let action = {
      title
    };

    if (titleWikiSource) {
      action['wikiSource'] = titleWikiSource;
    }

    this.props.dispatch(actions.getInfobox(action))
  }

  _render () {
    return (
      <div>
        <div dangerouslySetInnerHTML={{ __html: this.props.infobox }} />
      </div>
    )
  }

  render () {
    const { infoboxState } = this.props
    return (
      <StateRenderer
        componentState={infoboxState}
        loaderDisabled={true}
        loaderMessage="Loading Infobox..."
        errorMessage="Error while loading infobox! Please try again later!"
        onRender={() => this._render()}
      />
    )
  }
}

InfoBox.propTypes = {
  dispatch: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  wikiSource: PropTypes.string.isRequired,
  infobox: PropTypes.string,
  infoboxState: PropTypes.string,
}

const mapStateToProps = (state) =>
  Object.assign({}, state.wiki)

export default connect(mapStateToProps)(InfoBox)
