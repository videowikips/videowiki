import React, { PropTypes } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import querystring from 'querystring';
import moment from 'moment';
import { Container, Grid } from 'semantic-ui-react';

import StateRenderer from '../../components/common/StateRenderer';
import Editor from '../../components/Editor';

import fileUtils from '../../utils/fileUtils';
import videosActions from '../../actions/VideoActionCreators';

const styles = {
  container: {
    // height: 54,
  },
  separator: {
    position: 'absolute',
    display: 'inline-block',
    height: '95%',
    width: 1,
    background: 'black',
    zIndex: 2,
    left: '30%',
  },
  title: {
    fontWeight: 'bold',
    display: 'inline-block',
    width: '30%',
    padding: '.7rem',
    textAlign: 'left',
    backgroundColor: '#61bbff',
    borderBottom: '2px solid rgb(97, 187, 255)',
    borderTop: 'none',
    verticalAlign: 'top',
    float: 'left',
    maxWidth: '30%',
    height: '110%',
  },
  description: {
    display: 'inline-block',
    padding: '.7rem',
    position: 'relative',
    verticalAlign: 'middle',
    wordBreak: 'break-word',
    float: 'left',
    width: '70%',
    maxWidth: '70%',
    backgroundColor: 'white',
    border: '2px solid white',
  },
}
class VideosHistory extends React.Component {
  componentWillMount() {
    const { title } = this.props.match.params;
    const { wikiSource } = querystring.parse(location.search.replace('?', ''))
    this.props.dispatch(videosActions.fetchVideoHistory({ title, wikiSource }))
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
  _renderFileInfo(audioInfo) {
    // const date = audioInfo.formTemplate && audioInfo.formTemplate.form ? moment(audioInfo.formTemplate.form.date).format('DD MMMM YYYY') : 'Unknown';
    const date = moment(audioInfo.created_at).format('DD MMMM YYYY')
    const authorsSource = audioInfo && audioInfo.wikiSource ? `https://xtools.wmflabs.org/articleinfo/${audioInfo.wikiSource.replace('https://', '')}/${audioInfo.title}?format=html` : '';
    // const commonsUrl = this.getDecriptionUrl(audioInfo.commonsUrl);

    return (
      <div style={{ border: '1px solid', borderLeft: '1px solid', marginTop: 10, backgroundColor: '#61bbff' }} >
        <div style={styles.separator} ></div>
        {/* <div style={{ ...styles.container, height: 50 }}>
          <div style={{ ...styles.title, height: '120%' }}>Commons URL</div>
          <div style={styles.description}>
            <a target="_blank" href={commonsUrl} >{commonsUrl}</a>
          </div>
        </div>
        <div style={{ content: '', clear: 'both' }} ></div> */}
        <div style={{ ...styles.container }}>
          <div style={{ ...styles.title }}>Download</div>
          <div style={styles.description}>
            <a href="javascript:void(0)" onClick={() => fileUtils.downloadFile(audioInfo.url) } >Click here</a>
          </div>
        </div>
        <div style={{ content: '', clear: 'both' }} ></div>

        <div style={styles.container}>
          <div style={styles.title}>Authors</div>
          <div style={styles.description}>
            VideoWiki Foundation, <a target="_blank" href={authorsSource} >Authors of the Article</a>
          </div>
        </div>
        <div style={{ content: '', clear: 'both' }} ></div>

        <div style={styles.container}>
          <div style={styles.title}>Licence</div>
          <div style={styles.description}>
            <a target="_blank" href="https://creativecommons.org/licenses/by-sa/4.0/" >Creative Commons 4.0</a>
          </div>
        </div>
        <div style={{ content: '', clear: 'both' }} ></div>

        <div style={styles.container}>
          <div style={styles.title}>Date</div>
          <div style={styles.description}>
            {date}
          </div>
        </div>
        <div style={{ content: '', clear: 'both' }} ></div>

        <div style={styles.container}>
          <div style={styles.title}>Version</div>
          <div style={styles.description}>
            {audioInfo.version}
          </div>
        </div>
        <div style={{ content: '', clear: 'both' }} ></div>

      </div>
    )
  }

  _render() {
    const { title } = this.props.match.params;
    const { wikiSource } = querystring.parse(location.search.replace('?', ''))

    return (
      <div>
        <div>
          <div style={{ textAlign: 'center', border: '2px solid  #a09c9c', padding: 40, marginBottom: 20, display: 'flex' }} >
            <h3 style={{ flex: 5, margin: 0, textAlign: 'left' }}>
              <Link to={`/videowiki/${title}?wikiSource=${wikiSource}`} >Back to article</Link>
            </h3>
            <h3 style={{ flex: 10, margin: 0, textAlign: 'left', wordBreak: 'break-all' }} >Export History: {title}</h3>
          </div>
        </div>
        {this.props.videosHistory && this.props.videosHistory.videos.length === 0 && (
          <h1 style={{ textAlign: 'center', marginTop: 120, marginLeft: -50 }} >No vidoes are currently exported for this article</h1>
        )}
        <Grid>
          {this.props.videosHistory.videos.map((video) => (
            <Grid.Row key={video._id}>
              <Grid.Column computer={11} tablet={11} mobile={16} >
                {video.article && (
                  <Editor
                  mode="editor"
                  match={this.props.match}
                  article={video.article}
                  />
                )}
              </Grid.Column>

              <Grid.Column computer={5} tablet={5} only="computer tablet" >
                <div style={{ height: '100%' }} >
                  <div style={{ height: '40%', marginTop: '3%' }} >
                    <video src={video.url} controls width={'100%'} height={'100%'} />
                  </div>
                  <div style={{ height: '60%', position: 'relative' }} >
                    <div style={{ position: 'absolute', bottom: '0.7rem', width: '100%' }}>
                      {this._renderFileInfo(video)}
                    </div>
                  </div>
                </div>
              </Grid.Column>
              <Grid.Column mobile={16} only="mobile" >
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', marginTop: 20 }} >
                  <video src={video.url} controls width={'100%'} height={'100%'} />
                  <div style={{ position: 'relative', width: '100%' }} >
                    {this._renderFileInfo(video)}
                  </div>
                </div>
              </Grid.Column>
            </Grid.Row>
          ))}
        </Grid>
      </div>
    )
  }

  render() {
    const { fetchVideosHistoryState } = this.props.videosHistory;
    return (
      <StateRenderer
        componentState={fetchVideosHistoryState}
        loaderImage="/img/view-loader.gif"
        loaderMessage="Loading your article videos from the sum of all human knowledge!"
        errorMessage="Error while loading videos! Please try again later!"
        onRender={() => this._render()}
      />
    )
  }
}

VideosHistory.propTypes = {
  match: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  videosHistory: PropTypes.object.isRequired,
}

const mapStateToProps = ({ video }) =>
  Object.assign({}, { videosHistory: video.videosHistory })

export default connect(mapStateToProps)(withRouter(VideosHistory));
