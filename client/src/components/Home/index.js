import React, { Component } from 'react'
import TopArticles from '../Articles/TopArticles'

export default class Home extends Component {
  render () {
    return (
      <div className="u-page-info u-center">
        <div className="joinUsLogo">
          <p>We are building the video version of Wikipedia. Join Us.</p>
        </div>
        <TopArticles />
      </div>
    )
  }
}
