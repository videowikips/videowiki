import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Progress, Button } from 'semantic-ui-react'
import { withRouter } from 'react-router-dom'
import queryString from 'query-string';

import StateRenderer from '../common/StateRenderer'

import actions from '../../actions/WikiActionCreators'
import articleActions from '../../actions/ArticleActionCreators'

class WikiProgress extends Component {
  componentWillMount () {
    const { match, dispatch } = this.props
    const title = match.params.title
    const { wikiSource } = queryString.parse(location.search);

    // dispatch(actions.convertWiki({ title, wikiSource }))
    dispatch(articleActions.fetchConversionProgress({ title, wikiSource }))
    this._startPoller()
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.conversionPercentage.converted === true && nextProps.conversionPercentage.progress === 100) {
      this._stopPoller()
      setTimeout(() => {
        this._navigateToArticle()
      }, 100);
    }
  }

  componentWillUnmount () {
    this._stopPoller()
  }

  _startPoller () {
    const { match, dispatch } = this.props
    const title = match.params.title
    const { wikiSource } = queryString.parse(location.search);

    this._sessionPoller = setInterval(() => {
      dispatch(articleActions.fetchConversionProgress({ title, wikiSource }))
    }, 10000)
  }

  _stopPoller () {
    clearInterval(this._sessionPoller)
    this._sessionPoller = null
  }

  _navigateToArticle () {
    setTimeout(() => {
      if (this.props.conversionPercentage.converted) {
        const { wikiSource } = queryString.parse(location.search);
        
        this.props.history.push(`/${this.props.language}/videowiki/${this.props.conversionPercentage.title}?wikiSource=${wikiSource}`)
      } else {
        this._startPoller()
      }
    }, 1000)
  }

  _render () {
    const { match, conversionPercentage } = this.props
    const title = match.params.title

    const progress = conversionPercentage ? conversionPercentage.progress : 0

    return (
      <div className="u-page-center">
        <h2>{ `Converting Wikipedia Article for ${title.split('_').join(' ')} to VideoWiki` }</h2>
        <Progress className="c-app-conversion-progress" percent={progress} progress indicating />
        <div>
          <span>{`Converting - ${progress}% converted`}</span>
        </div>

        <div>
          <strong>Quick Fact: </strong>
          It takes 4-5 minutes to convert an article. So get some <img className="c-app-coffee" src="https://s3.eu-central-1.amazonaws.com/vwpmedia/statics/coffee.png" /> until then.
        </div>
      </div>
    )
  }

  render () {
    return this._render()
  }
}

const mapStateToProps = (state) =>
  Object.assign({ language: state.ui.language }, state.wikiProgress, state.article)

export default withRouter(connect(mapStateToProps)(WikiProgress))

WikiProgress.propTypes = {
  dispatch: PropTypes.func.isRequired,
  match: PropTypes.object,
  conversionPercentage: PropTypes.object,
  conversionPercentageState: PropTypes.string.isRequired,
  history: React.PropTypes.shape({
    push: React.PropTypes.func.isRequired,
  }).isRequired,
  language: React.PropTypes.string.isRequired,
}
