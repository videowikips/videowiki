import React, { Component } from 'react'

export default class Footer extends Component {
  render () {
    return (
      <footer className="c-app__footer">
        &copy; {new Date().getFullYear()} VideoWiki
      </footer>
    )
  }
}
