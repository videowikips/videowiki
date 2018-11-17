import React, { Component } from 'react'
import { Icon } from 'semantic-ui-react'
import TopArticles from '../Articles/TopArticles'

export default class Home extends Component {
  render() {
    return (
      <div className="u-page-info u-center">
        <div className="joinUsLogo">
          <p>We are building the video version of Wikipedia.<br />
            <a
              className="learnmore"
              target="_blank"
              href="https://medium.com/videowiki/the-hidden-meaning-behind-videowikis-new-logo-ff9e339afd52"
            >
              Learn more
            </a>
            <a
              className="butn detail_button get_started_btn bold supportvidewiki"
              style={{ textDecoration: 'none', fontSize: 16 }}
              href="https://meta.wikimedia.org/wiki/Wiki_Video"
              target="_blank"
            >
              <Icon name="heart" />  Support VideoWiki on Meta
            </a>
          </p>
        </div>
        <TopArticles />
      </div>
    )
  }
}
