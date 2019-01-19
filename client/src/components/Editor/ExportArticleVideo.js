import React, {
  PropTypes,
} from 'react';

import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import { Icon, Popup, Dropdown, Modal, Button, Checkbox } from 'semantic-ui-react';
// import UploadFileInfoModal from '../common/UploadFileInfoModal';
// import { othersworkLicenceOptions } from '../common/licenceOptions';
import { NotificationManager } from 'react-notifications';

import AuthModal from '../common/AuthModal';
import fileUtils from '../../utils/fileUtils';

import videosActions from '../../actions/VideoActionCreators';
import wikiActions from '../../actions/WikiActionCreators';
// const UPLOAD_FORM_INITIAL_VALUES = {
//   licence: othersworkLicenceOptions[2].value,
//   licenceText: othersworkLicenceOptions[2].text,
//   licenceSection: othersworkLicenceOptions[2].section,
//   source: 'others',
//   sourceUrl: location.href,
// }

class ExportArticleVideo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      updating: false,
      withSubtitles: false,
      autoDownload: false,
      submitLoadingPercentage: 0,
      isLoginModalVisible: false,
      isUploadFormVisible: false,
      isAutodownloadModalVisible: false,
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.video.exportArticleToVideoState === 'loading' && nextProps.video.exportArticleToVideoState === 'done') {
      NotificationManager.success('Article has been queued to be converted successfully!');
      this.setState({ isUploadFormVisible: false });
      this.props.dispatch(wikiActions.clearSlideForm(this.props.articleId, 'exportvideo'));
      if (nextProps.video.video && nextProps.video.video._id) {
        setTimeout(() => {
          this.props.history.push(`/videos/progress/${nextProps.video.video._id}`);
        }, 1000);
      }
    } else if (this.props.video.exportArticleToVideoState === 'loading' && nextProps.video.exportArticleToVideoState === 'failed') {
      const error = nextProps.video.exportArticleToVideoError || 'Something went wrong, please try again later';
      NotificationManager.info(error);
      this.setState({ isUploadFormVisible: false });
      this.props.dispatch(wikiActions.clearSlideForm(this.props.articleId, 'exportvideo'));
    }
  }

  onClose() {
    this.setState({ open: false });
  }

  onOptionSelect(value) {
    if (value === 'history') {
      console.log('navigating to ', `/videos/history/${this.props.title}?wikiSource=${this.props.wikiSource}`)
      return this.props.history.push(`/videos/history/${this.props.title}?wikiSource=${this.props.wikiSource}`);
    } else if (value === 'export' && !this.props.authenticated) {
      this.setState({ isLoginModalVisible: true })
    } else if (value === 'export' && this.props.authenticated) {
      if (this.props.isExportable) {
        // this.setState({ isUploadFormVisible: true });
        this.setState({ isAutodownloadModalVisible: true });
      } else {
        NotificationManager.info('Only custom articles and articles with less than 50 slides can be exported.');
      }
    } else if (value === 'download') {
      console.log('download the video ', this.props.articleVideo)
      fileUtils.downloadFile(this.props.articleVideo.video.url);
    }
  }

  // onExportFormSubmit(formValues) {
  //   this.props.dispatch(videosActions.exportArticleToVideo({ ...formValues, title: this.props.title, wikiSource: this.props.wikiSource }));
  // }

  onExport() {
    const { title, wikiSource } = this.props;
    const { autoDownload, withSubtitles } = this.state;

    this.props.dispatch(videosActions.exportArticleToVideo({ title, wikiSource, autoDownload, withSubtitles }));
    this.setState({ isAutodownloadModalVisible: false });
  }

  render() {
    const { fetchArticleVideoState, articleVideo } = this.props;

    return (
      <a onClick={() => this.setState({ open: true })} className="c-editor__footer-wiki c-editor__footer-sidebar c-editor__toolbar-publish c-app-footer__link " >
        <Dropdown
          className="import-dropdown export-video-dropdown"
          inline
          compact
          direction="left"
          onChange={this.onOptionSelect.bind(this)}
          options={[
            {
              text: (
                <p onClick={() => this.onOptionSelect('history')}>
                  Export History
                </p>
              ),
              value: 'history',
            }, {
              text: fetchArticleVideoState === 'done' && (
                <p onClick={() => this.onOptionSelect(articleVideo.exported ? 'download' : 'export')} >
                  {articleVideo.exported ? 'Download' : 'Export' } Video
                </p>
              ),
              value: 'export',
            },
          ]}
          icon={
            <Popup
              position="top right"
              trigger={
                <Icon inverted color="grey" name="video" />
              }
              content={
                <p>Export Video</p>
              }
            />
          }
        />
        <AuthModal open={this.state.isLoginModalVisible} heading="Only logged in users can export videos to Commons" onClose={() => this.setState({ isLoginModalVisible: false })} />

        {this.state.isAutodownloadModalVisible && (
          <Modal size="small" open={this.state.isAutodownloadModalVisible} onClose={() => this.setState({ isAutodownloadModalVisible: false })} >
            <Modal.Header>Export "{this.props.title.split('_').join(' ')}" to video</Modal.Header>
            <Modal.Content>
              <Modal.Description>
                <div>
                  <Checkbox
                    checked={this.state.withSubtitles}
                    onChange={(e, { checked }) => this.setState({ withSubtitles: checked })}
                    label="Include Subtitles"
                  />
                </div>
                <br />
                <div>
                  <Checkbox
                    label="Auto download the video after it's exported"
                    checked={this.state.autoDownload}
                    onChange={(e, { checked }) => this.setState({ autoDownload: checked })}
                  />
                </div>
              </Modal.Description>
            </Modal.Content>
            <Modal.Actions>
              <div>
                <Button onClick={() => this.setState({ isAutodownloadModalVisible: false })}>Cancel</Button>
                <Button primary onClick={() => this.onExport()} >
                  Export
                </Button>
              </div>
            </Modal.Actions>
          </Modal>
        )}
        {/* {this.state.isUploadFormVisible && (
          <UploadFileInfoModal
            standalone
            withSubtitles
            subTitle={`Upload exported video for ${this.props.title}`}
            initialFormValues={UPLOAD_FORM_INITIAL_VALUES}
            articleId={this.props.articleId}
            currentSlideIndex="exportvideo"
            uploadMessage="Hold on tight!"
            title={this.props.title}
            wikiSource={this.props.wikiSource}
            visible={this.state.isUploadFormVisible}
            onClose={() => this.setState({ isUploadFormVisible: false })}
            onSubmit={this.onExportFormSubmit.bind(this)}
          />
        )} */}
      </a>
    )
  }
}

ExportArticleVideo.propTypes = {
  title: PropTypes.string.isRequired,
  wikiSource: PropTypes.string.isRequired,
  authenticated: PropTypes.bool,
  isExportable: PropTypes.bool.isRequired,
  history: PropTypes.object.isRequired,
  articleId: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  video: PropTypes.object.isRequired,
  articleVideo: PropTypes.object,
  fetchArticleVideoState: PropTypes.string,
}

ExportArticleVideo.defaultProps = {
  authenticated: false,
  fetchArticleVideoState: '',
  articleVideo: {
    video: {},
    exported: false,
  },
}

const mapStateToProps = ({ video }) => Object.assign({}, { video })

export default connect(mapStateToProps)(withRouter(ExportArticleVideo));
