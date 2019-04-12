import React, { Component } from 'react'
import { Icon } from 'semantic-ui-react'
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
      <p>{text}</p>
    </a>
  );
}
export default class Home extends Component {
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
        </div>
        <TopArticles />
      </div>
    )
  }
}
