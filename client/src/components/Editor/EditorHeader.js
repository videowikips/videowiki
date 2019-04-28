import React, { Component, PropTypes } from 'react'
import { withRouter } from 'react-router-dom'
import { Button, Icon, Popup } from 'semantic-ui-react'
import copy from 'clipboard-copy';
import {
  ShareButtons,
  generateShareIcon,
} from 'react-share'
import { NotificationManager } from 'react-notifications';
import Blinker from '../common/Blinker';
import UpdateArticleModal from './modals/UpdateArticleModal';
import ExportArticleVideo from './ExportArticleVideo';
import AddHumanVoiceModal from './modals/AddHumanVoiceModal';
import AuthModal from '../common/AuthModal';

const {
  FacebookShareButton,
  // GooglePlusShareButton,
  TwitterShareButton,
  VKShareButton,
  RedditShareButton,
} = ShareButtons

const FacebookIcon = generateShareIcon('facebook')
const TwitterIcon = generateShareIcon('twitter')
// const GooglePlusIcon = generateShareIcon('google')
const VKIcon = generateShareIcon('vk')
const RedditIcon = generateShareIcon('reddit')

class EditorHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      blink: false,
      addHumanVoiceModalVisible: false,
      isLoginModalVisible: false,
    }
  }

  componentDidMount() {
    this.setState({ blink: true })
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.currentSlide && nextProps.currentSlide.position > -1 &&
      this.props.currentSlide && this.props.currentSlide.position > -1 &&
      this.props.currentSlide.position !== nextProps.currentSlide.position &&
      (!nextProps.currentSlide.media)
    ) {
      this.setState({ blink: true })
    }
  }

  onCopy() {
    copy(location.href);
    NotificationManager.success('Link copied to clipboard');
  }

  onAddHumanVoice(lang) {
    const { article, language } = this.props;
    this.props.history.push(`/${language}/export/humanvoice/${article.title}?wikiSource=${article.wikiSource}&lang=${lang}`);
  }

  onTranslateButtonClick() {
    const { article, authenticated } = this.props;
    if (!authenticated) {
      return this.setState({ isLoginModalVisible: true });
    }

    if (article.ns !== 0 || article.slides.length < 50) {
      return this.setState({ addHumanVoiceModalVisible: true });
    }

    return NotificationManager.info('Only custom articles and articles with less than 50 slides can be exported.');
  }

  _renderUpdateButton() {
    if (!this.props.showOptions) return;
    return (
      <UpdateArticleModal title={this.props.article.title} wikiSource={this.props.article.wikiSource} />
    )
  }

  _renderExportArticle() {
    if (!this.props.showOptions || !this.props.article) return;
    const { article, fetchArticleVideoState, articleVideo, articleLastVideo } = this.props;
    const isExportable = article.ns !== 0 || article.slides.length < 50;

    return this.props.mode === 'viewer' ? (
      <ExportArticleVideo
        fetchArticleVideoState={fetchArticleVideoState}
        articleVideo={articleVideo}
        articleLastVideo={articleLastVideo}
        isExportable={isExportable}
        articleId={article._id}
        title={article.title}
        wikiSource={article.wikiSource}
        authenticated={this.props.authenticated}
      />
    ) : null;
  }

  _renderLoginModal() {
    return (
      <AuthModal
        open={this.state.isLoginModalVisible}
        heading="Only logged in users can export videos to Commons"
        onClose={() => this.setState({ isLoginModalVisible: false })}
      />
    )
  }

  _renderShareButton() {
    return (
      <Button
        basic
        icon
        className="c-editor__toolbar-publish"
        title="Share"
      >
        <Icon name="share alternate" inverted color="grey" />
      </Button>
    )
  }

  _renderShareButtons() {
    if (!this.props.showOptions) return;
    const { article } = this.props
    const title = article.title.split('_').join(' ')
    const url = location.href;
    const description = `Checkout the new VideoWiki article at ${location.href}`

    return (
      <span>
        <Popup
          trigger={(
            <span style={{ display: 'inline-block' }}>
              <FacebookShareButton
                url={url}
                title={title}
                picture={article.image}
                description={description}
                className="c-editor__share-icon"
              >
                <FacebookIcon
                  size={32}
                  round
                />
              </FacebookShareButton>
            </span>
            )}
        >
          Facebook
        </Popup>

        <Popup
          trigger={(
            <span style={{ display: 'inline-block' }}>
              <TwitterShareButton
                url={url}
                title={title}
                className="c-editor__share-icon"
              >
                <TwitterIcon
                  size={32}
                  round
                />
              </TwitterShareButton>
            </span>
            )}
        >
          Twitter
        </Popup>

        <Popup
          trigger={(
            <span style={{ display: 'inline-block' }}>
              <VKShareButton
              url={url}
              image={article.image}
              windowWidth={660}
              windowHeight={460}
              className="c-editor__share-icon"
              >
                <VKIcon
                  size={32}
                  round
                />
              </VKShareButton>
            </span>
          )}
        >
          VK
        </Popup>

        <Popup
          trigger={(
            <span style={{ display: 'inline-block' }} >
              <RedditShareButton
                url={url}
                title={title}
                windowWidth={660}
                windowHeight={460}
                className="c-editor__share-icon"
              >
                <RedditIcon
                  size={32}
                  round
                />
              </RedditShareButton>
            </span>
          )}
        >
          Reddit
        </Popup>
        <Popup
          trigger={(
            <Button style={{ position: 'relative', top: -9, width: 32, height: 32 }} circular color="primary" icon="copy" onClick={this.onCopy.bind(this)} />
          )}
        >
          Copy article link
        </Popup>
      </span>
    )
  }

  _renderShareIcon() {
    if (!this.props.showOptions) return;

    return this.props.mode === 'viewer' ? (
      <Popup
        trigger={this._renderShareButton()}
        hoverable
      >
        {this._renderShareButtons()}
      </Popup>
    ) : null
  }

  _navigateToEditor() {
    const { article } = this.props
    const wikiSource = article.wikiSource || 'https://en.wikipedia.org';

    if (article.mediaSource === 'script') {
      return NotificationManager.info('The media of custom Videowiki articles are editable only in the script page');
    }
    this.props.history.push(`/${this.props.language}/editor/${article.title}?wikiSource=${wikiSource}`)
  }

  _navigateToArticle() {
    const { article } = this.props
    const wikiSource = article.wikiSource || 'https://en.wikipedia.org';
    window.open(`${wikiSource}/wiki/${article.title}`);
  }

  _publishArticle() {
    this.props.onPublishArticle()
  }

  _renderPublishOrEditIcon() {
    if (!this.props.showOptions && !this.props.showPublish) return;

    return this.props.mode === 'viewer' ? (
      <Blinker
        secondary="#1678c2"
        interval={1500}
        repeat={3}
        blink={this.state.blink}
        onStop={() => this.setState({ blink: false })}
      >
        <Button
          basic
          icon
          className="c-editor__toolbar-publish"
          style={{ height: '100%' }}
          title="Verify/Edit text and media"
          onClick={() => this._navigateToArticle()}
        >
          <Icon name="pencil" inverted color="grey" />
        </Button>
      </Blinker>
    ) : (
      <Button
        size="huge"
        basic
        icon
        className="c-editor__toolbar-publish"
        title="Publish"
        onClick={() => this._publishArticle()}
      >
        <Icon name="save" inverted color="grey" />
      </Button>
      )
  }

  _renderBackButton() {
    if (this.props.mode === 'viewer') return;
    return (
      <Button
        size="huge"
        basic
        icon
        className="c-editor__toolbar-publish"
        title="Back to article"
        onClick={() => this.props.onBack()}
      >
        <Icon name="chevron left" inverted color="grey" />
      </Button>
    )
  }

  _renderTranslateButton() {
    if (this.props.mode !== 'viewer') return;
    return (
      <a
        className="c-editor__footer-wiki c-editor__footer-sidebar c-editor__toolbar-publish c-app-footer__link "
        style={{ paddingRight: '1.2em' }}
        href="javascript:void(0)"
        onClick={this.onTranslateButtonClick.bind(this)}
      >
        <Popup
          trigger={
            <Icon name="translate" inverted color="grey" />
          }
        >
          Translate and export
        </Popup>
      </a>
    )
  }

  _renderAddHumanVoiceModal() {
    return (
      <AddHumanVoiceModal
        open={this.state.addHumanVoiceModalVisible}
        onClose={() => this.setState({ addHumanVoiceModalVisible: false })}
        skippable={false}
        disabledLanguages={[this.props.language]}
        onSubmit={(val) => this.onAddHumanVoice(val)}
      />
    )
  }
  render() {
    const { article } = this.props
    const wikiSource = article.wikiSource || 'https://en.wikipedia.org';
    return (
      <div className="c-editor__toolbar">
        {this._renderBackButton()}
        <span className="c-editor__toolbar-title">{article.title.split('_').join(' ')}</span>
        {this._renderTranslateButton()}
        {this._renderExportArticle()}
        {this._renderUpdateButton()}
        {/* <a
          className="c-editor__footer-wiki c-editor__footer-sidebar c-editor__toolbar-publish c-app-footer__link "
          href={`${wikiSource}/wiki/${article.title}`}
          target="_blank"
        >
          <Popup
            trigger={
              <Icon name="wikipedia w" inverted color="grey" />
            }
          >
            Verfiy/Edit Text
          </Popup>
        </a> */}
        {this._renderShareIcon()}
        {this._renderPublishOrEditIcon()}
        {this._renderAddHumanVoiceModal()}
        {this._renderLoginModal()}
      </div>
    )
  }
}

EditorHeader.propTypes = {
  article: PropTypes.object.isRequired,
  mode: PropTypes.string,
  language: PropTypes.string.isRequired,
  history: React.PropTypes.shape({
    push: React.PropTypes.func.isRequired,
  }).isRequired,
  onPublishArticle: PropTypes.func.isRequired,
  currentSlide: PropTypes.object.isRequired,
  showOptions: PropTypes.bool.isRequired,
  showPublish: PropTypes.bool,
  fetchArticleVideoState: PropTypes.string,
  authenticated: PropTypes.bool,
  articleVideo: PropTypes.object,
  articleLastVideo: PropTypes.object,
  onBack: PropTypes.func,
  onTranslate: PropTypes.func,
}

EditorHeader.defaultProps = {
  authenticated: false,
  fetchArticleVideoState: '',
  showPublish: false,
  articleVideo: {
    video: {},
    exported: false,
  },
  articleLastVideo: {},
  onBack: () => {},
  onTranslate: () => {},
}

export default withRouter(EditorHeader)
