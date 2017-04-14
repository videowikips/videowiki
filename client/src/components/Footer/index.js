import React, { Component } from 'react'

export default class Footer extends Component {
  render () {
    return (
      <div className="app__footer">
        &copy; 2010&ndash;{new Date().getFullYear()} VideoWiki
      </div>
    )
  }
}
