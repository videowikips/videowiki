import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Grid, Button, Icon, Card, Progress, Input } from 'semantic-ui-react';
import queryString from 'query-string';
import { NotificationManager } from 'react-notifications';

import TranslateBox from './TranslateBox';
import AudioRecorder from '../../components/common/AudioRecorder';
import SlidesList from './SlidesList';
import TranslateTutorial from './TranslateTutorial';
import Editor from '../../components/Editor';
import InvalidPublishModal from './InvalidPublishModal';
import StateRenderer from '../../components/common/StateRenderer';
import UploadFileInfoModal from '../../components/common/UploadFileInfoModal';
import { othersworkLicenceOptions } from '../../components/common/licenceOptions';
import websockets from '../../websockets';

import humanVoiceActions from '../../actions/HumanVoiceActionCreators';
import articleActions from '../../actions/ArticleActionCreators';
import videosActions from '../../actions/VideoActionCreators';
import wikiActions from '../../actions/WikiActionCreators';
import TranslateBoxV2 from './TranslateBoxV2';
import AudioRecorderV2 from '../../components/common/AudioRecorder/v2';
import SlidesListV2 from './SlidesListV2';

function mapTranslatedSlidesArray(slides) {
  const obj = {};
  slides.forEach((slide) => {
    obj[slide.position] = slide.text
  });

  return obj;
}
class ExportHumanVoice extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lang: '',
      currentSlideIndex: 0,
      enableAudioProcessing: true,
      record: false,
      recordedAudio: null,
      article: null,
      isPlaying: false,
      inPreview: false,
      editorMuted: false,
      uploadAudioLoading: false,
      saveTranslatedTextLoading: false,
      invalidPublishModalVisible: false,
      isUploadFormVisible: false,
      UPLOAD_FORM_INITIAL_VALUES: {
        licence: othersworkLicenceOptions[2].value,
        licenceText: othersworkLicenceOptions[2].text,
        licenceSection: othersworkLicenceOptions[2].section,
        source: 'others',
      },
      translatedSlides: {},
      isDone: false,
      afterSavePreviewStart: false,
      afterSavePreviewEnd: false,
      uploadAudioInputValue: null,
    }
  }

  componentWillMount() {
    if (process.env.NODE_ENV === 'production' && (!this.props.auth.session || !this.props.auth.session.user || !this.props.auth.session.token)) {
      return this.props.history.push(`/${this.props.language}`);
    }
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

  componentDidMount() {
    websockets.subscribeToEvent(websockets.websocketsEvents.HUMANVOICE_AUDIO_PROCESSING, (data) => {
      const { success, humanvoiceId, slideAudioInfo } = data;
      if (humanvoiceId === this.props.humanvoice.humanvoice._id) {
        if (!this.state.isPlaying) {

          if (success) {
            this.setState((state) => {
              const article = state.article;
              article.slides[slideAudioInfo.position].customAudio = slideAudioInfo.audioURL;
              article.slides[slideAudioInfo.position].completed = true;
              return {
                article,
                uploadAudioLoading: false,
                uploadAudioInputValue: null,
              }
            })
          } else {
            this.setState({
              uploadAudioLoading: false,
              uploadAudioInputValue: null,
            });
            NotificationManager.info('Something went wrong while processing the audio, we kept you original recording though.');
          }
        }

      } else {
        // NotificationManager.error('Invalid human voice item');
      }
    })
  }

  componentDidUpdate() {
    if (this.canPublish() && !this.state.isDone) {
      console.log('+++++++++++++++++++++ isDone ++++++++++++++++++');
      this.setState((state) => {
        const { article, translatedSlides } = state;
        const { lang } = queryString.parse(location.search);
        this.props.humanvoice.humanvoice.audios.forEach((audio) => {
          if (audio.position < article.slides.length) {
            article.slides[audio.position].audio = audio.audioURL;
            // if (lang !== article.lang) {
            //   article.slides[audio.position].text = translatedSlides[audio.position];
            // }
          }
        })
        return { article, isDone: true };
      })
    } else if (!this.canPublish() && this.state.isDone) {
      this.setState((state) => {
        // { isDone: false }
        const { article } = state;
        article.slides.forEach((slide, index) => {
          slide.audio = this.props.article.slides[index].audio;
          // slide.text = this.props.article.slides[index].text;
        })
        return { article, isDone: false };
      });
    }
  }

  componentWillUnmount() {
    if (this.props.article && this.props.article._id) {
      this.props.dispatch(wikiActions.clearSlideForm(this.props.article._id, 'exportvideo'));
    }
    websockets.unsubscribeFromEvent(websockets.websocketsEvents.HUMANVOICE_AUDIO_PROCESSING);
  }

  componentWillReceiveProps(nextProps) {
    // success action for loading the article
    if (this.props.fetchArticleState === 'loading' && nextProps.fetchArticleState === 'done') {
      if (nextProps.article) {
        const { title } = this.props.match.params;
        const { wikiSource, lang } = queryString.parse(location.search);
        const article = nextProps.article;
        // Clear audios from all slides
        // article.slides.forEach((slide) => {
        //   slide.audio = '';
        // })
        const articleClone = JSON.parse(JSON.stringify(article));
        // if (lang) {
        //   articleClone.title = `${articleClone.title}/${lang}`
        // }
        this.setState({ article: articleClone });
        // clear upload modal form
        this.props.dispatch(wikiActions.clearSlideForm(nextProps.article._id, 'exportvideo'));
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
          const { enableAudioProcessing, article } = state;
          article.slides[uploadedSlideAudio.position].customAudio = uploadedSlideAudio.audioURL;
          article.slides[uploadedSlideAudio.position].completed = true;
          return {
            article: { ...article },
            uploadAudioLoading: false,
            uploadAudioInputValue: null,
          }
        })
        NotificationManager.success('Audio Uploaded')
      }
    }

    // Saving translated text
    if (this.props.humanvoice.saveTranslatedTextState === 'loading' && nextProps.humanvoice.saveTranslatedTextState !== 'loading') {
      if (nextProps.humanvoice.saveTranslatedTextState === 'done' && nextProps.humanvoice.translatedTextInfo) {
        const { translatedTextInfo } = nextProps.humanvoice;
        let oldSlideIndex;
        this.setState((state) => {
          const { translatedSlides, currentSlideIndex, article } = state;
          let newSlideIndex = currentSlideIndex;
          oldSlideIndex = currentSlideIndex;
          translatedSlides[translatedTextInfo.position] = translatedTextInfo.text;
          // Move to next slide after saving text
          if (article.slides[currentSlideIndex].completed && currentSlideIndex < (article.slides.length - 1)) {
            newSlideIndex += 1;
          }
          // if (this.canPublish()) {
          //   article.slides[translatedTextInfo.position].text = translatedTextInfo.text;
          // }
          return { translatedSlides, currentSlideIndex: newSlideIndex, article, afterSavePreviewStart: true };
        }, () => {
          const { article } = this.state;
          if (article.slides[oldSlideIndex] && article.slides[oldSlideIndex].completed) {
            setTimeout(() => {
              this.setState({ isPlaying: true });
            }, 500);
          }
        })
      } else {
        NotificationManager.error('Something went wrong while updating the text, please try again');
      }
      this.setState({ saveTranslatedTextLoading: false });
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

        let translatedSlides = {};
        if (humanvoice.translatedSlides) {
          translatedSlides = mapTranslatedSlidesArray(humanvoice.translatedSlides);
        }
        return { article, translatedSlides };
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
      return ({ record, recordedAudio: record ? null : state.recordedAudio, isPlaying: record, editorMuted: record, article });
    });
  }

  onPreviewFinalVideo() {
    console.log('on preview final video');
    this.setState((state) => {
      const inPreview = !state.inPreview;
      const { article, translatedSlides } = state;
      const { lang } = queryString.parse(location.search);
      // If we'll be in preview, set the article audios to the user custom audios
      // otherwise, reset the audios to the TTS audios
      // debugger;
      if (inPreview) {
        this.props.humanvoice.humanvoice.audios.forEach((audio) => {
          if (audio.position < article.slides.length) {
            article.slidesHtml[audio.position].audio = audio.audioURL;
            if (lang !== article.lang) {
              article.slidesHtml[audio.position].text = translatedSlides[audio.position];
            }
          }
        })
      } else if (!this.canPublish()) {
        article.slides.forEach((slide, index) => {
          slide.audio = this.props.article.slides[index].audio;
          slide.text = this.props.article.slides[index].text;
        })
      } else if (!inPreview) {
        article.slides.forEach((slide, index) => {
          slide.text = this.props.article.slidesHtml[index].text;
          slide.audio = this.props.article.slidesHtml[index].audio;
        })
      }
      return { article: { ...article }, inPreview, currentSlideIndex: 0 };
    }, () => {
      if (this.state.inPreview) {
        this.setState({ isPlaying: true });
        NotificationManager.info('Click on the publish icon when you are done previewing');
      } else {
        this.setState({ isPlaying: false })
      }
    })
  }

  onPreviewEnd() {
    this.setState((state) => {
      const { article } = state;
      // Reset the origianl TTS audios on the article
      article.slidesHtml.forEach((slide, index) => {
        slide.audio = this.props.article.slidesHtml[index].audio;
        slide.text = this.props.article.slidesHtml[index].text;
      })

      return { article, inPreview: false, isPlaying: false, currentSlideIndex: 0, editorMuted: false };
    })
  }

  onSlideChange(newIndex) {
    const { article, inPreview, afterSavePreviewStart, afterSavePreviewEnd } = this.state;
    const customAudio = article.slides[newIndex].customAudio;
    console.log('aftersavePreview', afterSavePreviewStart, afterSavePreviewEnd);
    if (afterSavePreviewStart) {
      return this.setState({ isPlaying: false, afterSavePreviewStart: false, afterSavePreviewEnd: true, currentSlideIndex: newIndex });
    }
    if (afterSavePreviewEnd) {
      return this.setState({ isPlaying: false, afterSavePreviewStart: false, afterSavePreviewEnd: false, currentSlideIndex: newIndex - 1 });
    }
    // We need to force the audio player to re-render, so we clear the custom audio
    // and set it back in a new cycle of the event loop
    article.slides[newIndex].customAudio = '';
    this.setState({ article, currentSlideIndex: newIndex, isPlaying: inPreview, afterSavePreviewStart: false, afterSavePreviewEnd: false }, () => {
      this.setState((state) => {
        const article = state.article;
        article.slides[newIndex].customAudio = customAudio;
        return { article, editorMuted: false };
      })
    })
  }

  onStop(recordedBlob) {
    console.log('recordedBlob is: ', recordedBlob);
    if (recordedBlob) {
      this.setState((state) => {
        const article = state.article;
        // Add audio info to current slide
        article.slides[state.currentSlideIndex].customAudio = recordedBlob;
        article.slides[state.currentSlideIndex].audioBlob = { blob: recordedBlob };
        article.slides[state.currentSlideIndex].completed = false;

        return { recordedAudio: recordedBlob, article, record: false, isPlaying: false, editorMuted: false, };
      }, () => {
        this.onUploadAudioToSlide()
      });
    } else {
      this.setState({ record: false });
    }
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

  canRecord() {
    const { uploadAudioLoading } = this.state;

    return !uploadAudioLoading;
  }

  canPublish() {
    const { article, translatedSlides } = this.state;
    if (!article || !translatedSlides) return false;

    const { lang } = queryString.parse(location.search);
    const translatedSlidesValid = lang === article.lang ? true : article.slides.length <= Object.keys(translatedSlides).length;
    return translatedSlidesValid && article.slides.every((slide) => slide.completed);
  }

  onUploadAudioToSlide() {
    const { article, currentSlideIndex, lang, enableAudioProcessing } = this.state;
    const { title, wikiSource } = article;
    console.log(article.slides[currentSlideIndex]);
    const blob = article.slides[currentSlideIndex].audioBlob ? article.slides[currentSlideIndex].audioBlob && article.slides[currentSlideIndex].audioBlob.blob : null;
    if (blob) {
      this.props.dispatch(humanVoiceActions.uploadSlideAudioHumanvoice({
        title,
        wikiSource,
        lang,
        slideNumber: currentSlideIndex,
        blob,
        enableAudioProcessing,
      }));
      this.setState({ uploadAudioLoading: true });
    } else {
      NotificationManager.error('Unable to upload audio, please try again.');
    }
  }

  onUploadAudioChange(e) {
    const { article, currentSlideIndex, lang, enableAudioProcessing } = this.state;
    const { title, wikiSource } = article;
    if (e.target.files && e.target.files.length > 0) {
      this.props.dispatch(humanVoiceActions.uploadSlideAudioHumanvoice({
        title,
        wikiSource,
        lang,
        slideNumber: currentSlideIndex,
        blob: e.target.files[0],
        enableAudioProcessing,
      }));
      this.setState({ uploadAudioLoading: true, uploadAudioInputValue: e.target.value });
    }
  }

  onPublish() {
    const publishValid = this.canPublish();
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

  onSaveTranslatedText(value) {
    const { lang } = queryString.parse(location.search);
    this.setState((state) => {
      const { translatedSlides, currentSlideIndex, article } = state;
      const { title, wikiSource } = article;
      translatedSlides[currentSlideIndex] = value;

      this.props.dispatch(humanVoiceActions.saveTranslatedText({ title, wikiSource, lang, slideNumber: currentSlideIndex, text: value }));
      return {
        saveTranslatedTextLoading: true,
        translatedSlides,
      }
    })
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

  _renderPreviewFinalVideo() {
    if (!this.canPublish()) return;

    return (
      <Button color={this.state.inPreview ? 'blue' : 'green'} className="c-export-human-voice__final_preview_button" onClick={this.onPreviewFinalVideo.bind(this)} >
        {!this.state.inPreview ? 'Preview Final Video' : 'Stop Preview'}
      </Button>
    )
  }

  _renderSlideTranslateBox() {
    const { translatedSlides, currentSlideIndex, saveTranslatedTextLoading, article } = this.state;
    const { lang } = queryString.parse(location.search);

    if (!article) return;
    if (article.lang === lang) return;

    return (
      <TranslateBoxV2
        value={translatedSlides[currentSlideIndex] || ''}
        onSave={this.onSaveTranslatedText.bind(this)}
        loading={saveTranslatedTextLoading}
        currentSlideIndex={currentSlideIndex}
      />
    )
  }

  _renderProgress() {
    const { article } = this.state;
    const { humanvoice } = this.props.humanvoice;
    const { lang } = queryString.parse(location.search);

    if (!article || !humanvoice) {
      return (
        <Progress progress indicating percent={0} />
      );
    }
    const total = article.slides.length;
    let value = 0;
    const translatedSlidesObj = mapTranslatedSlidesArray(humanvoice.translatedSlides);
    article.slides.forEach((slide, index) => {
      if (slide.completed && (lang === article.lang || (humanvoice.translatedSlides && translatedSlidesObj[index] && translatedSlidesObj[index].trim()))) {
        value += 1;
      }
    });
    return (
      <Progress progress size="small" color="green" style={{ marginBottom: 0 }} percent={Math.ceil(value / total * 100)} />
    );
  }

  _renderUploadAudio() {
    return (
      <Input
        input={(
          <input
            type="file"
            onChange={this.onUploadAudioChange.bind(this)}
            value={this.state.uploadAudioInputValue}
            accept=".webm, .mp3, .wav"
          />
        )}
      />
    );
  }

  _renderRecordAudio() {
    const { uploadAudioLoading, record, article, currentSlideIndex } = this.state;
    const hasAudio = article.slides[currentSlideIndex].completed

    return (
      <div
        style={{ display: 'flex', alignItems: 'center', height: '5rem' }}
      >

        <AudioRecorderV2
          style={{ marginRight: 10 }}
          record={record}
          loading={uploadAudioLoading}
          showLabel={!hasAudio}
          disabled={uploadAudioLoading}
          onStart={this.toggleRecording.bind(this)}
          // maxDuration={article.slides[currentSlideIndex].duration / 1000}
          className="c-export-human-voice__recorder-mic"
          onStop={this.onStop.bind(this)}
          backgroundColor="#2185d0"
          strokeColor="#000000"
        />

        {!record && !uploadAudioLoading && (

          <span>
            <Button
              circular
              basic
              icon="cloud upload"
              color="teal"
              onClick={() => document.getElementById('upload-audio-input').click()}
              content={hasAudio ? null : 'Upload'}
            />
            <Input
              input={(
                <input
                  ref={(r) => this.uploadRef = r}
                  disabled={uploadAudioLoading}
                  type="file"
                  id="upload-audio-input"
                  style={{ visibility: 'hidden', position: 'absolute', zIndex: -1 }}
                  onChange={this.onUploadAudioChange.bind(this)}
                  value={this.state.uploadAudioInputValue}
                  accept=".webm, .mp3, .wav, .m4a"
                />
              )}
            />
          </span>
        )}
        {!uploadAudioLoading && article && article.slides[currentSlideIndex] && article.slides[currentSlideIndex].customAudio && !record && (
          <div className="c-export-human-voice__audio_container" >
            <audio
              controls
              onPlay={() => this.setState({ isPlaying: true, editorMuted: true })}
              onPause={() => this.setState({ isPlaying: false, editorMuted: false })}
              onEnded={() => this.setState({ isPlaying: false, editorMuted: false })}
            >
              <source src={article.slides[currentSlideIndex].completed ? `https:${article.slides[currentSlideIndex].customAudio}` : article.slides[currentSlideIndex].customAudio} />
              Your browser does not support the audio element.
            </audio>
            <Icon name="close" className="c-export-human-voice__clear-record" onClick={() => this.onDeleteAudio(currentSlideIndex)} />
          </div>
        )}
      </div>
    )

  }
  _renderSLidesList() {
    const { article, currentSlideIndex } = this.state;

    return (

      <Grid>
        <Grid.Row>
          <Grid.Column width={10}>
            <h5>
              ALL SLIDES ({article && article.slides ? article.slides.length : 0})
            <Button
                basic
                circular
                size="tiny"
                disabled={!this.canPublish()}
                style={{ marginLeft: 10, fontSize: '0.6em' }}
                icon={this.state.inPreview ? 'pause' : 'play'}
                color="teal"
                onClick={() => {
                  if (this.state.inPreview) {
                    this.onPreviewEnd();
                  } else {
                    this.onPreviewFinalVideo();
                  }
                }}
              />
            </h5>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={16}>
            {this._renderProgress()}
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={16}>
            <Grid>
              <SlidesListV2
                currentSlideIndex={currentSlideIndex}
                slides={article.slides}
                onSubslideClick={this.onSlideChange.bind(this)}
              />
            </Grid>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }

  _render() {
    const { currentSlideIndex, article, record, isPlaying, uploadAudioLoading, editorMuted, inPreview, translatedSlides } = this.state;
    const { lang } = queryString.parse(location.search);
    if (!article) return <div>loading...</div>;

    return (
      <div>
        <Grid>
          <Grid.Row>
            <Grid.Column computer={10} mobile={16}>
              <Editor
                mode="viewer"
                layout={1}
                controlled
                customPublish
                headerOptions={{
                  showPublish: true,
                  title: `${article.title}/${lang}`
                }}
                muted={editorMuted}
                article={article}
                isPlaying={isPlaying}
                match={this.props.match}
                onPlay={() => this.setState({ isPlaying: true })}
                currentSlideIndex={currentSlideIndex}
                onPublish={this.onPublish.bind(this)}
                onSlideChange={this.onSlideChange.bind(this)}
                onPlayComplete={() => inPreview && this.onPreviewEnd()}
              />

            </Grid.Column>
            <Grid.Column computer={6} mobile={16}>
              <Grid>
                <Grid.Row>
                  <Grid.Column width={16}>
                    {this._renderSlideTranslateBox()}
                    {this._renderRecordAudio()}
                  </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                  <Grid.Column width={16}>
                    {this._renderSLidesList()}
                  </Grid.Column>
                </Grid.Row>
              </Grid>
              {/* {this._renderPreviewFinalVideo()} */}
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

const mapStateToProps = ({ article, humanvoice, video, ui, auth }) =>
  Object.assign({}, {
    article: article.article,
    fetchArticleState: article.fetchArticleState,
    articleLastVideo: article.articleLastVideo,
    humanvoice,
    video,
    language: ui.language,
    auth,
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
  auth: PropTypes.object.isRequired,
}

ExportHumanVoice.defaultProps = {
  article: {},
  articleLastVideo: {},
}

export default connect(mapStateToProps)(withRouter(ExportHumanVoice));
