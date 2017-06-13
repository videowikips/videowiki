import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Progress } from 'semantic-ui-react'

import StateRenderer from '../common/StateRenderer'

import actions from '../../actions/WikiActionCreators'
import articleActions from '../../actions/ArticleActionCreators'

class WikiProgress extends Component {
  componentWillMount () {
    const { match, dispatch } = this.props
    const title = match.params.title

    dispatch(actions.convertWiki({ title }))
    dispatch(articleActions.fetchConversionProgress({ title }))
    this._startPoller()
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.conversionPercentage.converted === true) {
      this._stopPoller()
    }
  }

  componentWillUnmount () {
    this._stopPoller()
  }

  _startPoller () {
    const { match, dispatch } = this.props
    const title = match.params.title

    this._sessionPoller = setInterval(() => {
      dispatch(articleActions.fetchConversionProgress({ title }))
    }, 10000)
  }

  _stopPoller () {
    clearInterval(this._sessionPoller)
    this._sessionPoller = null
  }

  _render () {
    return (
      <div>
        <Progress percent={this.props.conversionPercentage.progress} indicating />
      </div>
    )
  }

  render () {
    const { conversionPercentageState } = this.props
    return (
      <StateRenderer
        componentState={conversionPercentageState}
        loaderMessage="Checking article conversion progress..."
        errorMessage="Error while loading article progress! Please try again later!"
        onRender={() => this._render()}
      />
    )
  }
}

const mapStateToProps = (state) =>
  Object.assign({}, state.wikiProgress, state.article)

export default connect(mapStateToProps)(WikiProgress)

WikiProgress.propTypes = {
  dispatch: PropTypes.func.isRequired,
  match: PropTypes.object,
  conversionPercentage: PropTypes.number,
  conversionPercentageState: PropTypes.string.isRequired,
}
