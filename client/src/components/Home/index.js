import React, { Component, PropTypes } from 'react'
import { withRouter } from 'react-router-dom';
import { Icon, Button, Popup, Input } from 'semantic-ui-react'
import TopArticles from '../Articles/TopArticles'

const links = [
  {
    icon: 'book',
    text: 'Script-writing',
    link: 'https://en.wikipedia.org/wiki/Wikipedia:VideoWiki/Script-Writing',
  },
  {
    icon: 'microphone',
    text: 'Voice-over',
    link: 'https://en.wikipedia.org/wiki/Wikipedia:VideoWiki/Voice-Over',
  },
  {
    icon: 'file video outline',
    text: 'Video Editing',
    link: 'https://en.wikipedia.org/wiki/Wikipedia:VideoWiki/Video_Editing',
  },
  {
    icon: 'star',
    text: <p>Full Stack <br />Content Creator</p>,
    link: 'https://en.wikipedia.org/wiki/Wikipedia:VideoWiki/Full_Stack_Content_Creator',
  },
  {
    icon: 'translate',
    text: 'Translator',
    link: 'https://en.wikipedia.org/wiki/Wikipedia:VideoWiki/Translators',
  },
];

function RenderBox({ icon, text, key, link }) {
  return (
    <a className="c-app-home__wikilinks" target="_blank" href={link} key={key}>
      <Icon name={icon} size="large" /> <br />
      <span>{text}</span>
    </a>
  );
}
class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newVideoTitle: '',
    }
  }

  onCreateNewVideo() {
    if (this.state.newVideoTitle && this.state.newVideoTitle.trim().length > 0) {
      let title = this.state.newVideoTitle;
      this.setState({ newVideoTitle: '' });
      if (title.indexOf('Wikipedia:VideoWiki/') === -1) {
        title = `Wikipedia:VideoWiki/${title}`
      }
      document.body.click();
      setTimeout(() => {
        window.open(`https://${this.props.match.params.lang}.wikipedia.org/wiki/${title.trim()}`)
      }, 100);
    }
  }

  render() {
    return (
      <div className="u-page-info u-center">
        <div className="joinUsLogo">
          <p>We are building collaborative wiki-based videos in local languages. Join Us.</p>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <div style={{ flex: 1 }} ></div>
            {links.map((link) => RenderBox({ ...link, key: link.text + link.icon }))}
            <div style={{ flex: 1 }} ></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '2rem' }} >
            <Popup
              hideOnScroll
              trigger={(
                <Button style={{ backgroundColor: '#3a9e3a', color: 'white', border: '2px solid black' }} size="huge">
                  Create a New Video
                </Button>
              )}
              content={(
                <Input
                  value={this.state.newVideoTitle}
                  onKeyDown={(e) => e.keyCode === 13 && this.onCreateNewVideo()}
                  onChange={(e) => this.setState({ newVideoTitle: e.target.value })}
                  style={{ width: '400px' }}
                  action={(
                    <Button color="blue" onClick={this.onCreateNewVideo.bind(this)}>Go</Button>
                  )}
                  placeholder="Enter title of the video"
                />
              )}
              on="click"
              position="bottom center"
            />
          </div>
        </div>
        <TopArticles />
      </div>
    )
  }
}

Home.propTypes = {
  match: PropTypes.object.isRequired,
}

export default withRouter(Home);
