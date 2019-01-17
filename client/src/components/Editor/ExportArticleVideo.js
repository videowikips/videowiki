import React, {
  PropTypes,
} from 'react';

import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import { Icon, Popup, Dropdown } from 'semantic-ui-react';
import UploadFileInfoModal from '../common/UploadFileInfoModal';
import { othersworkLicenceOptions } from '../common/licenceOptions';
import { NotificationManager } from 'react-notifications';

import AuthModal from '../common/AuthModal';
import fileUtils from '../../utils/fileUtils';

import videosActions from '../../actions/VideoActionCreators';
import wikiActions from '../../actions/WikiActionCreators';
const UPLOAD_FORM_INITIAL_VALUES = {
  licence: othersworkLicenceOptions[2].value,
  licenceText: othersworkLicenceOptions[2].text,
  licenceSection: othersworkLicenceOptions[2].section,
  source: 'others',
  sourceUrl: location.href,
}

class ExportArticleVideo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      updating: false,
      submitLoadingPercentage: 0,
      isLoginModalVisible: false,
      isUploadFormVisible: false,
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
        this.props.dispatch(videosActions.exportArticleToVideo({ title: this.props.title, wikiSource: this.props.wikiSource }));
      } else {
        NotificationManager.info('Only custom articles and articles with less than 50 slides can be exported.');
        // NotificationManager.info('we\'re working hard to make it available for all articles');
      }
    } else if (value === 'download') {
      console.log('download the video ', this.props.articleVideo)
      // window.open(this.props.articleVideo.video.url);
      fileUtils.downloadFile(this.props.articleVideo.video.url);
    }
  }

  onExportFormSubmit(formValues) {
    this.props.dispatch(videosActions.exportArticleToVideo({ ...formValues, title: this.props.title, wikiSource: this.props.wikiSource }));
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
        {this.state.isUploadFormVisible && (
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
        )}
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
