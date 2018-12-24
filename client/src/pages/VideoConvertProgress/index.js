import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Progress } from 'semantic-ui-react';
import StateRenderer from '../../components/common/StateRenderer';
import videoActions from '../../actions/VideoActionCreators';

class VideoConvertProgress extends React.Component {
  componentWillMount () {
    const { match, dispatch } = this.props
    const { id } = match.params;

    dispatch(videoActions.fetchVideo({ id }))
    this._startPoller()
  }

  componentWillReceiveProps (nextProps) {
    // if (nextProps.conversionPercentage.converted === true) {
    //   this._stopPoller()
    //   this._navigateToHistory()
    // }
    const { videoConvertProgress } = nextProps;
    if (videoConvertProgress.video && ['failed', 'uploaded'].indexOf(videoConvertProgress.video.status) > -1 && this._sessionPoller) {
      this._stopPoller();
    }
    console.log('props are ', nextProps)
  }

  componentWillUnmount () {
    this._stopPoller()
  }

  _startPoller () {
    const { match, dispatch } = this.props
    const { id } = match.params

    this._sessionPoller = setInterval(() => {
      dispatch(videoActions.fetchVideo({ id }))
    }, 10000)
  }

  _stopPoller () {
    clearInterval(this._sessionPoller)
    this._sessionPoller = null
  }

  _navigateToHistory () {
    setTimeout(() => {
      const { title, wikiSource } = this.props.videoConvertProgress.video;
      this.props.history.push(`/videos/history/${title}?wikiSource=${wikiSource}`);
    }, 2000)
  }

  
  getDecriptionUrl (media) {

    if (!media) return null

    // Check if it's a thumbnail image or not (can be a video/gif)
    if (media.indexOf('thumb') > -1) {
      const re = /(upload\.wikimedia\.org).*(commons\/thumb\/.*\/.*\/)/
      const match = media.match(re)
      if (match && match.length === 3) {
        const pathParts = match[2].split('/')
        // Remove trailing / character
        pathParts.pop()
        return `https://commons.wikimedia.org/wiki/File:${pathParts[pathParts.length - 1]}`
      }
    } else {
      const re = /(upload\.wikimedia\.org).*(commons\/.*\/.*)/
      const match = media.match(re)
      if (match && match.length === 3) {
        const pathParts = match[2].split('/')
        return `https://commons.wikimedia.org/wiki/File:${pathParts[pathParts.length - 1]}`
      }
    }

    return null
  }

  _render () {
    const { match, videoConvertProgress } = this.props;
    if (!videoConvertProgress.video) return <div>loading...</div>;

    const title = videoConvertProgress.video ? videoConvertProgress.video.title : '';
    const status = videoConvertProgress.video ? videoConvertProgress.video.status : '';
    const progress = videoConvertProgress.video ? Math.floor(videoConvertProgress.video.conversionProgress) : 0;
    const commonsUrl = videoConvertProgress.video ? this.getDecriptionUrl(videoConvertProgress.video.commonsUrl) : '';

    return (
      <div className="u-page-center">
        {title && status !== 'failed' && (
          <h2>{ `Converting Videowiki Article for ${title.split('_').join(' ')} to Video` }</h2>
        )}
        {status === 'failed' && (
          <h2>
            Something went wrong while converting the article. please try again
            <br /><br />
            <Link to={`/videowiki/${videoConvertProgress.video.title}?wikiSource=${videoConvertProgress.video.wikiSource}`}>Back to article</Link>
          </h2>
        )}
        {status !== 'failed' && (
          <Progress className="c-app-conversion-progress" percent={progress} progress indicating />
        )}
        <div>
          {status === 'queued' && (
            <span>Your video is currently queued to be converted. please wait</span>
          )}
          {status === 'progress' && (
            <span>{`Converting - ${progress}% converted`}</span>
          )}
          {status === 'converted' && (
            <span>Converted Successfully! uploading to Commons...</span>
          )}
          {status === 'uploaded' && (
            <span>Your video is now available on Commons! <a href={commonsUrl} target="_blank" >Open on Commons</a></span>
          )}
        </div>

        {['failed', 'uploaded'].indexOf(status) === -1 && (
          <div>
            <strong>Quick Fact: </strong>
            It takes 4-5 minutes to convert an article. So get some <img className="c-app-coffee" src="https://s3.eu-central-1.amazonaws.com/vwpmedia/statics/coffee.png" /> until then.
          </div>
        )}
      </div>
    )
  }

  render () {
    // const { videoConvertProgress } = this.props;
    return this._render();
  }
}

VideoConvertProgress.propTypes = {
  dispatch: PropTypes.func.isRequired,
  match: PropTypes.object,
  videoConvertProgress: PropTypes.object.isRequired,
  history: React.PropTypes.shape({
    push: React.PropTypes.func.isRequired,
  }).isRequired,
}

const mapStateToProps = ({ video }) =>
  Object.assign({}, { videoConvertProgress: video.videoConvertProgress })

export default connect(mapStateToProps)(VideoConvertProgress);
