import React, { Component, PropTypes } from 'react'
import { withRouter } from 'react-router-dom'
import { Popup } from 'semantic-ui-react'
import actions from '../../actions/AuthActionCreators'
import { httpPost } from '../../apis/Common'

class Footer extends Component {
  constructor(props){
    super(props);
    this.state={
      term:''
    }
  }

  _renderContactUs () {
     return (
      <span className="c-app-footer__contact">
        Contact Us
      </span>
    )
  }

  _renderJoinSlack(){
    return (
      <span className="butn detail_button get_started_btn bold very_large_left_padding very_large_right_padding">
        Join Our Slack Community!
      </span>
    )
  }

  _renderSubmitEmail(email){
    const url = `/api/slackEmail/`
    const data = {
      email,
    }

    return httpPost(url,data)
    .then((res)=> {
      alert(res.text)
      this.setState({term:''})
    })
  }

  onInputChange(term){
    this.setState({term});
  }

  render () {
    const { location: { pathname } } = this.props
    return (pathname === '/' ||
      pathname === '/login' ||
      pathname === '/signup') ? (
        <footer className="c-app-footer">
          <p className="c-app-footer__top-line">Sum of all human knowledge in multi-media format, by human beings, for human beings. Text is available under the Creative Commons Attribution-ShareAlike License; Users retain ownership of images and videos uploaded by them.</p>
          <div className="cta">
            <Popup
              trigger={this._renderJoinSlack()}
              hoverable
              on='click'
              position='top center'>
              <span>
                <div className="invite-box-wrapper">
                  <div className="invite-box">
                    <div className="tagline">Join <strong>VideoWiki</strong> on Slack.</div>
                    <input
                      type="text"
                      placeholder="you@email.com"
                      value={this.state.term}
                      onChange={event => this.onInputChange(event.target.value)} />
                    <button
                      className="invite-button button"
                      data-state="active"
                      onClick={() => this._renderSubmitEmail(this.state.term)}>
                      Yes. Please send my invite.
                    </button><br />
                    <a className="invite-box-reset hidden">Join with another e-mail address?</a>
                  </div>
                </div>
              </span>
            </Popup>
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

            <span className="c-app-footer__about">
              <a href="/docs/VideoWiki-Terms-of-Use.docx" className="c-app-footer__link" target="_blank">
                Terms of Use
              </a>
            </span>
            <span className="c-app-footer__about">
              <a href="/docs/VideoWiki-Privacy-Policy.docx" className="c-app-footer__link" target="_blank">
                Privacy Policy
              </a>
            </span>
             <span className="c-app-footer__about">
              <a href="https://medium.com/videowiki" className="c-app-footer__link" target="_blank">
                Blog
              </a>
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
