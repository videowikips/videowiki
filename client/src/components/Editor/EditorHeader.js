import React, { Component, PropTypes } from 'react'
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
      >
        <Icon name="share alternate" />
      </Button>
    )
  }

  _renderShareButtons () {
    const { article } = this.props
    const title = article.title.split('_').join(' ')
    const url = `http://localhost:8080/videowiki/${article.title}`
    const description = `Checkout the new VideoWiki article at http://localhost:8080/videowiki/${article.title}`
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

  render () {
    const { article } = this.props

    return (
      <div className="c-editor__toolbar">
        <span className="c-editor__toolbar-title">{ article.title.split('_').join(' ') }</span>
        <Popup
          trigger={ this._renderShareButton() }
          hoverable
        >
          { this._renderShareButtons() }
        </Popup>
        <Button basic icon className="c-editor__toolbar-publish">
          <Icon name="save" />
        </Button>
      </div>
    )
  }
}

EditorHeader.propTypes = {
  article: PropTypes.object.isRequired,
}

export default EditorHeader
