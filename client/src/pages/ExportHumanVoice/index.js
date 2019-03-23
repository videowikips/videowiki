import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Grid, Button, Icon } from 'semantic-ui-react';
import queryString from 'query-string';
import { ReactMic } from 'react-mic';
import { NotificationManager } from 'react-notifications';

import SlidesList from './SlidesList';
import Editor from '../../components/Editor';
import InvalidPublishModal from './InvalidPublishModal';
import StateRenderer from '../../components/common/StateRenderer';
import UploadFileInfoModal from '../../components/common/UploadFileInfoModal';
import { othersworkLicenceOptions } from '../../components/common/licenceOptions';

import humanVoiceActions from '../../actions/HumanVoiceActionCreators';
import articleActions from '../../actions/ArticleActionCreators';
import videosActions from '../../actions/VideoActionCreators';
import wikiActions from '../../actions/WikiActionCreators';

class ExportHumanVoice extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lang: '',
      currentSlideIndex: 0,
      record: false,
      recordedAudio: null,
      article: null,
      isPlaying: false,
      uploadAudioLoading: false,
      invalidPublishModalVisible: false,
      isUploadFormVisible: false,
      UPLOAD_FORM_INITIAL_VALUES: {
        licence: othersworkLicenceOptions[2].value,
        licenceText: othersworkLicenceOptions[2].text,
        licenceSection: othersworkLicenceOptions[2].section,
        source: 'others',
      },
    }
  }

  componentWillMount() {
    const { title } = this.props.match.params;
    const { wikiSource, lang } = queryString.parse(location.search);
    if (!title || !wikiSource || !lang) {
      return this.props.history.push(`/videowiki/${title}`);
    }
    const { UPLOAD_FORM_INITIAL_VALUES } = this.state;
    UPLOAD_FORM_INITIAL_VALUES.sourceUrl = `${location.origin}/videowiki/${title}?wikiSource=${wikiSource}`;
    this.setState({ lang, UPLOAD_FORM_INITIAL_VALUES });
    this.props.dispatch(articleActions.fetchArticle({ title, wikiSource, mode: 'viewer' }));
  }

  componentWillReceiveProps(nextProps) {
    // success action for loading the article
    if (this.props.fetchArticleState === 'loading' && nextProps.fetchArticleState === 'done') {
      if (nextProps.article) {
        const { title } = this.props.match.params;
        const { wikiSource, lang } = queryString.parse(location.search);
        // Clear audios from all slides
        const article = nextProps.article;
        article.slides.forEach((slide) => {
          slide.audio = '';
        })
        this.setState({ article });
        // Fetch any stored human voice for this article made by the logged in user
        this.props.dispatch(humanVoiceActions.fetchArticleHumanVoice({ title, wikiSource, lang }));
        this.props.dispatch(articleActions.fetchVideoByArticleTitle({ title: article.title, wikiSource: article.wikiSource, lang: this.state.lang }));
      }
    }

    // success action for uploading audio to a slide
    if (this.props.humanvoice.uploadAudioToSlideState === 'loading' && nextProps.humanvoice.uploadAudioToSlideState === 'done') {
      if (nextProps.humanvoice.uploadedSlideAudio) {
        const { uploadedSlideAudio } = nextProps.humanvoice;
        this.setState((state) => {
          const article = state.article;
          article.slides[uploadedSlideAudio.position].customAudio = uploadedSlideAudio.audioURL;
          article.slides[uploadedSlideAudio.position].completed = true;
          return {
            article,
            uploadAudioLoading: false,
          }
        })
        NotificationManager.success('Audio Uploaded')
      }
    }

    // failed action for uploading audio to slide
    if (this.props.humanvoice.uploadAudioToSlideState === 'loading' && nextProps.humanvoice.uploadAudioToSlideState === 'failed') {
      this.setState({ uploadAudioLoading: false });
      NotificationManager.error('Something went wrong while uploading audio, please try again');
    }

    // Fetch previous records for this article
    if (this.props.humanvoice.fetchArticleHumanVoiceState === 'loading' && nextProps.humanvoice.fetchArticleHumanVoiceState === 'done' && nextProps.humanvoice.humanvoice) {
      // Set audios recorded before on this article
      this.setState((state) => {
        const article = state.article;
        const { humanvoice } = nextProps.humanvoice;
        humanvoice.audios.forEach((audio) => {
          if (audio.position < article.slides.length) {
            article.slides[audio.position].customAudio = audio.audioURL;
            article.slides[audio.position].completed = true;
          }
        })
        return { article };
      })
    }

    // delete custom audio from slide action
    if (this.props.humanvoice.deleteCustomAudioState === 'loading' && nextProps.humanvoice.deleteCustomAudioState !== 'loading') {
      this.setState({ uploadAudioLoading: false });
      if (nextProps.humanvoice.deleteCustomAudioState === 'done' && nextProps.humanvoice.deletedAudio) {
        // remove the audio from the slide
        this.setState((state) => {
          const article = state.article;
          article.slides[nextProps.humanvoice.deletedAudio.position].customAudio = '';
          article.slides[nextProps.humanvoice.deletedAudio.position].audioBlob = null;
          article.slides[nextProps.humanvoice.deletedAudio.position].completed = false;
          return { record: false, recordedAudio: null, article };
        })
      } else {
        window.location.reload();
      }
    }
    // Export article to video actions
    if (this.props.video.exportArticleToVideoState === 'loading' && nextProps.video.exportArticleToVideoState === 'done') {
      NotificationManager.success('Article has been queued to be exported successfully!');
      this.setState({ isUploadFormVisible: false });
      this.props.dispatch(wikiActions.clearSlideForm(this.props.article._id, 'exportvideo'));
      if (nextProps.video.video && nextProps.video.video._id) {
        setTimeout(() => {
          this.props.history.push(`/${this.props.language}/videos/progress/${nextProps.video.video._id}`);
        }, 1000);
      }
    } else if (this.props.video.exportArticleToVideoState === 'loading' && nextProps.video.exportArticleToVideoState === 'failed') {
      const error = nextProps.video.exportArticleToVideoError || 'Something went wrong, please try again later';
      NotificationManager.info(error);
      this.setState({ isUploadFormVisible: false });
      this.props.dispatch(wikiActions.clearSlideForm(this.props.article._id, 'exportvideo'));
    }
  }

  toggleRecording() {
    this.setState((state) => {
      const record = !state.record;
      const article = state.article;
      if (record) {
        article.slides[state.currentSlideIndex].customAudio = '';
        article.slides[state.currentSlideIndex].audioBlob = '';
      }
      return ({ record, recordedAudio: record ? null : state.recordedAudio, isPlaying: record, article });
    });
  }

  onSlideChange(newIndex) {
    const { article } = this.state;
    const customAudio = article.slides[newIndex].customAudio;
    // We need to force the audio player to re-render, so we clear the custom audio
    // and set it back in a new cycle of the event loop
    article.slides[newIndex].customAudio = '';
    this.setState({ article, currentSlideIndex: newIndex, isPlaying: false }, () => {
      this.setState((state) => {
        const article = state.article;
        article.slides[newIndex].customAudio = customAudio;
        return { article };
      })
    })
  }

  onStop(recordedBlob) {
    console.log('recordedBlob is: ', recordedBlob);
    this.setState((state) => {
      const article = state.article;
      // Add audio info to current slide
      article.slides[state.currentSlideIndex].customAudio = recordedBlob.blobURL;
      article.slides[state.currentSlideIndex].audioBlob = recordedBlob;
      article.slides[state.currentSlideIndex].completed = false;

      return { recordedAudio: recordedBlob, article };
    });
  }

  onDeleteAudio(slideIndex) {
    if (!this.state.article.slides[slideIndex].completed) {
      console.log('local delete');
      this.setState((state) => {
        const article = state.article;
        // Clear prev audio
        article.slides[slideIndex].customAudio = '';
        article.slides[state.currentSlideIndex].audioBlob = null;
        article.slides[slideIndex].completed = false;
        return { record: false, recordedAudio: null, article };
      });
    } else {
      const { title, wikiSource } = this.props.article;
      const { lang } = this.state;
      this.props.dispatch(humanVoiceActions.deleteCustomAudio({ title, wikiSource, lang, slideNumber: slideIndex }));
      this.setState({ uploadAudioLoading: true });
    }
  }

  canUpload() {
    const { article, currentSlideIndex } = this.state;

    return article.slides[currentSlideIndex].customAudio && !article.slides[currentSlideIndex].completed;
  }

  onUploadAudioToSlide() {
    const { article, currentSlideIndex, lang } = this.state;
    const { title, wikiSource } = article;
    console.log(article.slides[currentSlideIndex]);
    this.props.dispatch(humanVoiceActions.uploadSlideAudio({
      title,
      wikiSource,
      lang,
      slideNumber: currentSlideIndex,
      blob: article.slides[currentSlideIndex].audioBlob.blob,
    }));
    this.setState({ uploadAudioLoading: true });
  }

  onPublish() {
    const publishValid = this.state.article.slides.every((slide) => slide.completed);
    if (publishValid) {
      this.setState({ isUploadFormVisible: true });
    } else {
      this.setState({ invalidPublishModalVisible: true });
    }
  }

  onExportFormSubmit(formValues) {
    const { articleLastVideo } = this.props;
    const mode = articleLastVideo && articleLastVideo.commonsUrl && articleLastVideo.formTemplate ? 'update' : 'new';
    this.props.dispatch(videosActions.exportArticleToVideo({
      ...formValues,
      title: this.props.article.title,
      wikiSource: this.props.article.wikiSource,
      mode,
      humanvoiceId: this.props.humanvoice.humanvoice._id,
    }));
  }

  _renderInvalidPublishModal() {
    return (
      <InvalidPublishModal
        open={this.state.invalidPublishModalVisible}
        onClose={() => this.setState({ invalidPublishModalVisible: false })}
      />
    )
  }

  _renderUploadModal() {
    if (!this.props.article || !this.state.isUploadFormVisible) return;

    let initialFormValues = this.state.UPLOAD_FORM_INITIAL_VALUES;
    let disabledFields = [];
    let mode = 'new';
    const { articleLastVideo } = this.props;

    if (articleLastVideo && articleLastVideo.commonsUrl && articleLastVideo.formTemplate) {
      const { form } = articleLastVideo.formTemplate;

      initialFormValues = {
        ...form,
        title: form.fileTitle,
        categories: form.categories.map((title) => ({ title })),
        extraUsersInput: '',
        autoDownload: false,
        addExtraUsers: false,
        extraUsers: [],
      };
      disabledFields = ['title'];
      mode = 'update';
    }

    return (
      <UploadFileInfoModal
        standalone
        withSubtitles
        subTitle={`Upload exported video for ${this.props.article.title}`}
        initialFormValues={initialFormValues}
        disabledFields={disabledFields}
        showExtraUsers
        showAutoDownload
        mode={mode}
        articleId={this.props.article._id}
        currentSlideIndex="exportvideo"
        uploadMessage="Hold on tight!"
        title={this.props.article.title}
        wikiSource={this.props.article.wikiSource}
        visible={this.state.isUploadFormVisible}
        onClose={() => this.setState({ isUploadFormVisible: false })}
        onSubmit={this.onExportFormSubmit.bind(this)}
      />
    )
  }

  _render() {
    const { currentSlideIndex, article, record, isPlaying, uploadAudioLoading } = this.state;
    if (!article) return <div>loading...</div>;

    return (
      <div>
        <Grid>
          <Grid.Row>
            <Grid.Column computer={12} mobile={16}>
              {article && (
                <Editor
                  mode="editor"
                  showPublish
                  customPublish
                  article={article}
                  isPlaying={isPlaying}
                  match={this.props.match}
                  onPublish={this.onPublish.bind(this)}
                  onSlideChange={this.onSlideChange.bind(this)}
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
                  disabled={this.state.uploadAudioLoading}
                  onClick={this.toggleRecording.bind(this)}
                >
                  {!this.state.record ? (
                    <Icon name="microphone" />
                  ) : (
                    <Icon name="stop" />
                  )}
                  {!this.state.record ? ' Record' : ' Stop'}
                </Button>
                {article && article.slides[currentSlideIndex].customAudio && (
                  <div>
                    <audio
                      controls
                      onPlay={() => this.setState({ isPlaying: true })}
                      onPause={() => this.setState({ isPlaying: false })}
                      onEnded={() => this.setState({ isPlaying: false })}
                    >
                      <source src={article.slides[currentSlideIndex].customAudio} />
                      Your browser does not support the audio element.
                    </audio>
                    <Icon name="close" className="c-export-human-voice__clear-record" onClick={() => this.onDeleteAudio(currentSlideIndex)} />
                  </div>
                )}
              </div>
              <Button
                icon
                size="large"
                loading={uploadAudioLoading}
                iconPosition="left"
                disabled={!this.canUpload()}
                onClick={this.onUploadAudioToSlide.bind(this)}
              >
                <Icon name="upload" />
                &nbsp;Upload Audio to the slide
              </Button>
            </Grid.Column>
          </Grid.Row>
          {this._renderInvalidPublishModal()}
          {this._renderUploadModal()}
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

const mapStateToProps = ({ article, humanvoice, video, ui }) =>
  Object.assign({}, {
    article: article.article,
    fetchArticleState: article.fetchArticleState,
    articleLastVideo: article.articleLastVideo,
    humanvoice,
    video,
    language: ui.language,
  });

ExportHumanVoice.propTypes = {
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  fetchArticleState: PropTypes.string.isRequired,
  humanvoice: PropTypes.object.isRequired,
  video: PropTypes.object.isRequired,
  language: PropTypes.string.isRequired,
  article: PropTypes.object,
  articleLastVideo: PropTypes.object,
}

ExportHumanVoice.defaultProps = {
  article: {},
  articleLastVideo: {},
}

export default connect(mapStateToProps)(withRouter(ExportHumanVoice));
