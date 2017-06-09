import React, { Component, PropTypes } from 'react'
import { withRouter, Link } from 'react-router-dom'
import { Popup } from 'semantic-ui-react'

class Footer extends Component {
  _renderContactUs () {
    return (
      <span className="c-app-footer__contact">
        Contact Us
      </span>
    )
  }

  render () {
    const { location: { pathname } } = this.props

    return (pathname === '/' ||
      pathname === '/login' ||
      pathname === '/signup') ? (
        <footer className="c-app-footer">
          <p className="c-app-footer__top-line">Sum of all human knowledge in multi-media format, by human beings, for human beings.</p>
          <p className="c-app-footer__middle-line">Text is available under the Creative Commons Attribution-ShareAlike License; Users retain ownership of images and videos uploaded by them.</p>
          <p className="c-app-footer__bottom-line">By using this site, you agree to the{'\u00A0'}
            <span className="c-app-footer__actions--link">
              <a href="/docs/VideoWiki-Terms-of-Use.docx" className="c-app-footer__link" target="_blank">
                Terms of Use
              </a>
            </span> and{'\u00A0'}
            <span className="c-app-footer__actions--link">
              <a href="/docs/VideoWiki-Privacy-Policy.docx" className="c-app-footer__link" target="_blank">
                Privacy Policy
              </a>
            </span> and{'\u00A0'}
          </p>

          <div className="c-app-footer__actions">
            <span className="c-app-footer__about">
              <a href="/docs/VideoWiki-About-Us.docx" className="c-app-footer__link" target="_blank">
                About Us
              </a>
            </span>

            <Popup
              trigger={ this._renderContactUs() }
              hoverable
            >
              <span>
                Email -{'\u00A0'}
                <a className="c-app-footer__link" href="mailto:pratik.shetty@tlrfindia.com">
                  pratik.shetty@tlrfindia.com
                </a>
              </span>
            </Popup>
          </div>
        </footer>
    ) : null
  }
}

Footer.propTypes = {
  location: PropTypes.object.isRequired,
}

export default withRouter(Footer)
