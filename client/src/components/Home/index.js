import React, { Component } from 'react'
import TopArticles from '../Articles/TopArticles'

export default class Home extends Component {
  render () {
    return (
      <div className="u-page-info u-center">
        <div className="joinUsLogo">
          <p>We are building the video version of Wikipedia.<br />
           <a href="https://medium.com/videowiki/the-hidden-meaning-behind-videowikis-new-logo-ff9e339afd52">Join Us.</a>
          </p>
        </div>
        <TopArticles />
      </div>
    )
  }
}
