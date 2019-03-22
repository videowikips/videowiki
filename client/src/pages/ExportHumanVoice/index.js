import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Grid, Button, Icon } from 'semantic-ui-react';
import queryString from 'query-string';
import { ReactMic } from 'react-mic';

import SlidesList from './SlidesList';
import Editor from '../../components/Editor';
import StateRenderer from '../../components/common/StateRenderer';
import articleActions from '../../actions/ArticleActionCreators';

class ExportHumanVoice extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      currentSlideIndex: 0,
      record: false,
      recordedAudio: null,
      article: null,
      isPlaying: false,
    }
  }

  componentWillMount() {
    const { title } = this.props.match.params;
    const { wikiSource } = queryString.parse(location.search);
    this.props.dispatch(articleActions.fetchArticle({ title, wikiSource }));
  }

  componentWillUpdate(nextProps) {
    if (this.props.fetchArticleState === 'loading' && nextProps.fetchArticleState === 'done') {
      if (nextProps.article) {
        // Clear audios from all slides
        const article = nextProps.article;
        article.slides.forEach((slide) => {
          slide.audio = '';
        })
        this.setState({ article });
      }
    }
  }

  canUpload() {
    const { article, currentSlideIndex } = this.state;

    return article.slides[currentSlideIndex].audio && !article.slides[currentSlideIndex].uploaded;
  }

  toggleRecording() {
    this.setState((state) => ({ record: !state.record, recordedAudio: !state.record ? null : state.recordedAudio }));
  }

  onStop(recordedBlob) {
    console.log('recordedBlob is: ', recordedBlob);
    this.setState((state) => {
      const article = state.article;
      // Add audio info to current slide
      article.slides[state.currentSlideIndex].audio = recordedBlob.blobURL;
      article.slides[state.currentSlideIndex].audioBlob = recordedBlob;
      article.slides[state.currentSlideIndex].completed = false;
      article.slides[state.currentSlideIndex].uploaded = false;

      return { recordedAudio: recordedBlob, article };
    });
  }

  onDeleteAudio(slideIndex) {
    this.setState((state) => {
      const article = state.article;
      // Clear prev audio
      article.slides[slideIndex].audio = '';
      article.slides[state.currentSlideIndex].audioBlob = null;
      article.slides[slideIndex].completed = false;
      article.slides[slideIndex].uploaded = false;

      return { record: false, recordedAudio: null, article };
    });
  }

  _render() {
    const { currentSlideIndex, article, record, isPlaying } = this.state;
    if (!article) return <div>loading...</div>;

    return (
      <div>
        <Grid>
          <Grid.Row>
            <Grid.Column computer={12} mobile={16}>
              {article && (
                <Editor
                  mode="editor"
                  article={article}
                  isPlaying={isPlaying}
                  match={this.props.match}
                  onSlideChange={(newIndex) => this.setState({ currentSlideIndex: newIndex })}
                />
              )}
            </Grid.Column>
            <Grid.Column computer={4} mobile={16} style={{ marginTop: '2%' }}>
              {article && (
                <SlidesList slides={article.slides} currentSlideIndex={currentSlideIndex}/>
              )}
            </Grid.Column>
          </Grid.Row>

          <Grid.Row>
            <Grid.Column computer={12} mobile={16}>
              <ReactMic
                record={record}
                className="c-export-human-voice__recorder-mic"
                onStop={this.onStop.bind(this)}
                // onData={this.onData.bind(this)}
                strokeColor="#000000"
                backgroundColor="#FF4081"
              />
              <div className="c-export-human-voice__recorder-container">
                <Button
                  color="primary"
                  size="large"
                  icon
                  iconPosition="left"
                  onClick={this.toggleRecording.bind(this)}
                >
                  {!this.state.record ? (
                    <Icon name="microphone" />
                  ) : (
                    <Icon name="stop" />
                  )}
                  {!this.state.record ? ' Record' : ' Stop'}
                </Button>
                {article && article.slides[currentSlideIndex].audio && (
                  <div>
                    <audio
                      controls
                      onPlay={() => this.setState({ isPlaying: true })}
                      onPause={() => this.setState({ isPlaying: false })}
                      onEnded={() => this.setState({ isPlaying: false })}
                    >
                      <source src={article.slides[currentSlideIndex].audio} />
                      Your browser does not support the audio element.
                    </audio>
                    <Icon name="close" className="c-export-human-voice__clear-record" onClick={() => this.onDeleteAudio(currentSlideIndex)} />
                  </div>
                )}
              </div>
              <Button
                size="large"
                icon
                iconPosition="left"
                disabled={!this.canUpload()}
              >
                <Icon name="upload" />
                &nbsp;Upload Audio to the slide
              </Button>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    )
  }

  render() {
    const { fetchArticleState } = this.props;
    return (
      <StateRenderer
        componentState={fetchArticleState}
        loaderImage="/img/view-loader.gif"
        loaderMessage="Loading your article from the sum of all human knowledge!"
        errorMessage="Error while loading article! Please try again later!"
        onRender={() => this._render()}
      />
    )
  }
}

const mapStateToProps = ({ article }) =>
  Object.assign({}, { article: article.article, fetchArticleState: article.fetchArticleState });

ExportHumanVoice.propTypes = {
  match: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  fetchArticleState: PropTypes.string.isRequired,
  article: PropTypes.object,
}

ExportHumanVoice.defaultProps = {
  article: {},
}

export default connect(mapStateToProps)(withRouter(ExportHumanVoice));
