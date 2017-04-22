import React, { Component } from 'react'

const logo = '/img/earth.png'

export default class Logo extends Component {
  render () {
    return (
      <div className="c-logo">
        <img className="c-logo__img" src={logo}/>
        <h1 className="c-logo__title">VideoWiki</h1>
      </div>
    )
  }
}
