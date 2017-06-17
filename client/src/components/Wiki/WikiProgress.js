import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Progress, Button } from 'semantic-ui-react'
import { withRouter } from 'react-router-dom'

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
      this._navigateToArticle()
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

  _navigateToArticle () {
    this.props.history.push(`/videowiki/${this.props.conversionPercentage.title}`)
  }

  _render () {
    const { match, conversionPercentage } = this.props
    const title = match.params.title

    const progress = conversionPercentage ? conversionPercentage.progress : 0

    return (
      <div className="u-page-center">
        <h2>{ `Converting Wikipedia Article for ${title.split('_').join(' ')} to VideoWiki` }</h2>
        <Progress className="c-app-conversion-progress" percent={progress} progress />
        <div>
          <span>{`Converting - ${progress}% converted`}</span>
        </div>

        <div>
          <strong>Quick Fact: </strong>
          It takes 4-5 minutes to convert an article. So get some coffee until then.
        </div>
      </div>
    )
  }

  render () {
    return this._render()
  }
}

const mapStateToProps = (state) =>
  Object.assign({}, state.wikiProgress, state.article)

export default withRouter(connect(mapStateToProps)(WikiProgress))

WikiProgress.propTypes = {
  dispatch: PropTypes.func.isRequired,
  match: PropTypes.object,
  conversionPercentage: PropTypes.object,
  conversionPercentageState: PropTypes.string.isRequired,
  history: React.PropTypes.shape({
    push: React.PropTypes.func.isRequired,
  }).isRequired,
}
