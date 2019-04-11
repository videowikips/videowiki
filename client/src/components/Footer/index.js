import React, { Component, PropTypes } from 'react'
import { withRouter } from 'react-router-dom'
import { Popup } from 'semantic-ui-react'
import actions from '../../actions/AuthActionCreators'
import { httpPost } from '../../apis/Common'

class Footer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      term: ''
    }
  }

  _renderContactUs() {
    return (
      <span className="c-app-footer__contact">
        Contact Us
      </span>
    )
  }

  _renderSubmitEmail(email) {
    const url = `/api/slackEmail/`
    const data = {
      email,
    }

    return httpPost(url, data)
      .then((res) => {
        alert(res.text)
        this.setState({ term: '' })
      })
  }

  onInputChange(term) {
    this.setState({ term });
  }

  render() {
    const { location: { pathname }, language } = this.props
    return (pathname === `/${language}/` || `/${language}` ||
      pathname === '/login' ||
      pathname === '/signup') ? (
        <footer className="c-app-footer">
          <p className="c-app-footer__top-line">
            Text and audio are available under the
            <a style={{ fontWeight: 'bold', 'color': 'black' }} href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank"> Creative Commons Attribution-ShareAlike License 3.0 or later.</a> Images including those within videos are under various Open Licenses.
          </p>
          <div style={{ position: 'absolute', right: 10, top: 30 }} >
            <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank">
              <img src="/img/cc-by-sa.png" style={{ width: 150 }} />
            </a>
          </div>
          <div className="c-app-footer__actions">
            <span className="c-app-footer__about">
              <a
                href="https://medium.com/@pratik.shetty/videowiki-a-free-multi-media-encyclopedia-that-anyone-can-edit-94d7f021ca38"
                className="c-app-footer__link"
                target="_blank"
              >
                About Us
              </a>
            </span>

            <Popup
              trigger={this._renderContactUs()}
              hoverable
            >
              <span>
                Email -{'\u00A0'}
                <a className="c-app-footer__link" href="mailto:pratik.shetty@tlrfindia.com">
                  pratik.shetty@tlrfindia.com
                </a>
              </span>
            </Popup>

            <span className="c-app-footer__about">
              <a href="/docs/VideoWiki_Terms_of_Use.pdf" className="c-app-footer__link" target="_blank">
                Terms of Use
              </a>
            </span>
            <span className="c-app-footer__about">
              <a href="/docs/VideoWiki Privacy Policy August 2018.pdf" className="c-app-footer__link" target="_blank">
                Privacy Policy
              </a>
            </span>
            <span className="c-app-footer__about">
              <a href="https://medium.com/videowiki" className="c-app-footer__link" target="_blank">
                Blog
              </a>
            </span>
            <span className="c-app-footer__about">
              <a href="https://en.wikipedia.org/wiki/Wikipedia:VideoWiki/Bug_report" className="c-app-footer__link" target="_blank">
                Report Bugs
              </a>
            </span>
          </div>
        </footer>
      ) : null
  }
}

Footer.propTypes = {
  location: PropTypes.object.isRequired,
  language: PropTypes.string.isRequired,
}

export default withRouter(Footer)
