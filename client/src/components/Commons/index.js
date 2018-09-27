import React from 'react'
import { connect } from 'react-redux'
import { Container } from 'semantic-ui-react'
import StateRenderer from '../common/StateRenderer';
import articleActions from '../../actions/ArticleActionCreators'
/* eslint-disable */

const styles = {
  title: {
    fontWeight: 'bold',
    display: 'inline-block',
    width: 200,
    padding: 20,
    paddingLeft: 30,
    textAlign: 'left',
    backgroundColor: '#61bbff',
    borderLeft: '1px solid',
    borderRight: '2px solid',
    borderBottom: 'none',
    borderTop: 'none',
    verticalAlign: 'top'
  },
  description: {
    display: 'inline-block',
    padding: 20,
    position: 'relative',
  }
}

class Commons extends React.Component {

  componentWillMount() {
    const file = this.props.match.params.file;
    this.props.fetchAudioFileInfo({ file })
  }

  _renderFileInfo() {
    const { audioInfo } = this.props;

    return (
      <Container>
        <div style={{ border: '2px solid', borderLeft: '1px solid', }} >
          <div>
            <div style={{ ...styles.title, borderTop: '1px solid' }}>File</div>
            <div style={{ ...styles.description, padding: 10 }}>
              <audio controls src={audioInfo.source} />
            </div>
          </div>

          <div>
            <div style={styles.title}>Description</div>
            <div style={styles.description}>
              This is a spoken excerpt of the Wikipedia article: <a target="_blank" href={`/videowiki/${audioInfo.title}?wikiSource=${audioInfo.wikiSource}`} >{audioInfo.title}</a>
            </div>
          </div>

          <div>
            <div style={styles.title}>Accent</div>
            <div style={styles.description}>
              American English
            </div>
          </div>

          <div>
            <div style={styles.title}>Gender</div>
            <div style={styles.description}>
              Female
            </div>
          </div>

          <div>
            <div style={styles.title}>Duration</div>
            <div style={styles.description}>
              00:{audioInfo.duration} seconds ({audioInfo.size} MB)
            </div>
          </div>

          <div>
            <div style={styles.title}>Date</div>
            <div style={styles.description}>
              {/* {new Date()} */}
            </div>
          </div>

          <div>
            <div style={styles.title}>Source</div>
            <div style={styles.description}>
              Text-to-speech engine, Derivate of  <a target="_blank" href={`/videowiki/${audioInfo.title}?wikiSource=${audioInfo.wikiSource}`} >{audioInfo.title}</a>
            </div>
          </div>

          <div>
            <div style={styles.title}>Authors</div>
            <div style={styles.description}>
              Videowiki, <a target="_blank" href={`/videowiki/${audioInfo.title}?wikiSource=${audioInfo.wikiSource}`} >Authors of the Article</a>
            </div>
          </div>


          <div>
            <div style={styles.title}>Licence</div>
            <div style={styles.description}>
              <a target="_blank" href="https://creativecommons.org/licenses/by-sa/4.0/" >Creative Commons 4.0</a>
            </div>
          </div>

        </div>
      </Container>
    )
  }

  render() {
    console.log(this.props.match)
    const { fetchAudioFileInfoState } = this.props
    return (
      <StateRenderer
        componentState={fetchAudioFileInfoState}
        loaderImage="/img/view-loader.gif"
        loaderMessage="Loading!"
        errorMessage="Error while loading! Please try again later!"
        onRender={() => this._renderFileInfo()}
      />
    )
  }
}

const mapStateToProps = (state) => ({
  ...state.article
})

export default connect(mapStateToProps, { ...articleActions })(Commons)
