import React, { Component, PropTypes } from 'react'
import { withRouter, Link } from 'react-router-dom'

class Footer extends Component {
  render () {
    const { location: { pathname } } = this.props

    return (pathname === '/' ||
      pathname === '/login' ||
      pathname === '/signup') ? (
        <footer className="c-app-footer">
          <p className="c-app-footer__top-line">Sum of all human knowledge in multi-media format, by human beings, for human beings.</p>
          <p className="c-app-footer__middle-line">Text is available under the Creative Commons Attribution-ShareAlike License; Users retain ownership of images and videos uploaded by them.</p>
          <p className="c-app-footer__bottom-line">By using this site, you agree to the Terms of Use and Privacy Policy.</p>

          <div className="c-app-footer__actions">
            <span className="c-app-footer__about">
              <Link to="/about" className="c-app-footer__link">
                About Us
              </Link>
            </span>

            <span className="c-app-footer__contact">
              Contact Us
            </span>
          </div>
        </footer>
    ) : null
  }
}

Footer.propTypes = {
  location: PropTypes.object.isRequired,
}

export default withRouter(Footer)
