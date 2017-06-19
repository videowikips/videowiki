import React, { Component, PropTypes } from 'react'
import { withRouter } from 'react-router-dom'
import { Button, Icon, Popup } from 'semantic-ui-react'
import {
  ShareButtons,
  generateShareIcon,
} from 'react-share'

const {
  FacebookShareButton,
  GooglePlusShareButton,
  TwitterShareButton,
  VKShareButton,
  RedditShareButton,
} = ShareButtons

const FacebookIcon = generateShareIcon('facebook')
const TwitterIcon = generateShareIcon('twitter')
const GooglePlusIcon = generateShareIcon('google')
const VKIcon = generateShareIcon('vk')
const RedditIcon = generateShareIcon('reddit')

class EditorHeader extends Component {
  _renderShareButton () {
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

  _renderShareButtons () {
    const { article } = this.props
    const title = article.title.split('_').join(' ')
    const url = `http://dev.videowikipedia.org/videowiki/${article.title}`
    const description = `Checkout the new VideoWiki article at http://dev.videowikipedia.org/videowiki/${article.title}`
    return (
      <span>
        <FacebookShareButton
          url={url}
          title={title}
          picture={article.image}
          description={ description }
          className="c-editor__share-icon"
        >
          <FacebookIcon
            size={32}
            round
          />
        </FacebookShareButton>

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

        <GooglePlusShareButton
          url={url}
          className="c-editor__share-icon"
        >
          <GooglePlusIcon
            size={32}
            round
          />
        </GooglePlusShareButton>
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
    )
  }

  _renderShareIcon () {
    return this.props.mode === 'viewer' ? (
      <Popup
        trigger={ this._renderShareButton() }
        hoverable
      >
        { this._renderShareButtons() }
      </Popup>
    ) : null
  }

  _navigateToEditor () {
    this.props.history.push(`/editor/${this.props.article.title}`)
  }

  _publishArticle () {
    this.props.onPublishArticle()
  }

  _renderPublishOrEditIcon () {
    return this.props.mode === 'viewer' ? (
      <Button
        basic
        icon
        className="c-editor__toolbar-publish"
        title="Edit"
        onClick={() => this._navigateToEditor() }
      >
        <Icon name="pencil" inverted color="grey"/>
      </Button>
    ) : (
      <Button
        size="huge"
        basic
        icon
        className="c-editor__toolbar-publish"
        title="Publish"
        onClick={() => this._publishArticle()}
      >
        <Icon name="save" inverted color="grey"/>
      </Button>
    )
  }

  render () {
    const { article } = this.props

    return (
      <div className="c-editor__toolbar">
        <span className="c-editor__toolbar-title">{ article.title.split('_').join(' ') }</span>
        { this._renderShareIcon() }
        { this._renderPublishOrEditIcon() }
      </div>
    )
  }
}

EditorHeader.propTypes = {
  article: PropTypes.object.isRequired,
  mode: PropTypes.string,
  history: React.PropTypes.shape({
    push: React.PropTypes.func.isRequired,
  }).isRequired,
  onPublishArticle: PropTypes.func.isRequired,
}

export default withRouter(EditorHeader)
