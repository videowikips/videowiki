import React, { Component, PropTypes } from 'react'
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Popup, Icon } from 'semantic-ui-react';

import WikiSearch from './WikiSearch';
import Logo from './Logo';
import AuthButtons from './AuthButtons';
import UserProfileDropdown from './UserProfileDropdown';

import actions from '../../actions/ArticleActionCreators';
import authActions from '../../actions/AuthActionCreators';
import uiActions from '../../actions/UIActionCreators';

const styles = {
  disclaimerContainer: {
    textAlign: 'center',
    margin: 10,
  },
  disclaimerContent: {
    textAlign: 'left',
    fontSize: 16,
  },
  disclaimerClose: {
    position: 'absolute',
    right: 30,
    color: 'black',
  },
}

class Header extends Component {
  _startPoller () {
    this._sessionPoller = setInterval(() => {
      this.props.dispatch(actions.fetchArticleCount())
      this.props.dispatch(authActions.validateSession())
    }, 60000)
  }

  _stopPoller () {
    clearInterval(this._sessionPoller)
    this._sessionPoller = null
  }

  componentWillMount () {
    this.props.dispatch(actions.fetchArticleCount())
    this._startPoller()
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.location.pathname !== nextProps.location.pathname) {
      this.props.dispatch(actions.fetchArticleCount())
      this.props.dispatch(authActions.validateSession())
    }
  }

  componentWillUnmount () {
    this._stopPoller()
  }

  onCloseDisclaimer() {
    this.props.dispatch(uiActions.closeBetaDisclaimer());
  }

  _renderBetaDisclaimer() {
    if (!this.props.showBetaDisclaimer) return;

    return (
      <p style={styles.disclaimerContainer} >
        <Popup
          wide="very"
          position="bottom center"
          trigger={(
            <a href="javascript:void(0)">Read the Beta Disclaimer</a>
          )}
          content={(
            <div style={styles.disclaimerContent}>
              <p>
                <strong>VideoWiki</strong> is a proof of concept for a tool that allows you to collaboratively create and edit videos by dragging and dropping images and videos from Wikimedia Commons to relevant Wikipedia text.
              </p>
              <p>
                VideoWiki is currently in Beta stage and despite our progress, we are only scratching the surface. We are actively working towards adding many more features and additional functionality. Anyone, including yourself, can edit a VideoWiki article even without logging in. Your user name (if you use one) or IP address will be associated with your edits.
              </p>
            </div>
          )}
        />
        <a style={styles.disclaimerClose} onClick={this.onCloseDisclaimer.bind(this)} >
          <Icon name="close" />
        </a>
      </p>
    )
  }

  _renderUser () {
    const { session } = this.props
    return session ? (
      <UserProfileDropdown user={ session.user } />
    ) : <AuthButtons style={{ maxWidth: '10rem', lineHeight: '20px', padding: '.5rem' }} />
  }

  // _renderLeaderboard () {
  //   return this.props.session && this.props.session.user
  //   ? null
  //   : (
  //     <Link className="c-app-header__link" to="/leaderboard">Leaderboard</Link>
  //   )
  // }

  _renderArticleCount () {
    const { fetchArticleCountState, articleCount } = this.props

    return fetchArticleCountState === 'done' ? (
      <div>{ `( ${articleCount} articles )` }</div>
    ) : null
  }

  _renderAllArticle () {
    return (
      <Link to="/articles" className="c-app-header__link">
        <div>All Articles</div>
        { this._renderArticleCount() }
      </Link>
    )
  }

  render () {
    return (
      <div>
        {this._renderBetaDisclaimer()}
        <header className="c-app__header">
          <Logo className="c-app__header__logo" match={this.props.match} />
          <WikiSearch />
          { this._renderAllArticle() }
          {/* { this._renderLeaderboard() } */}
          { this._renderUser() }
        </header>
      </div>
    )
  }
}

Header.propTypes = {
  match: PropTypes.object.isRequired,
  session: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
  fetchArticleCountState: PropTypes.string,
  articleCount: PropTypes.number,
  location: PropTypes.object.isRequired,
  showBetaDisclaimer: PropTypes.bool.isRequired,
}

const mapStateToProps = (state) =>
  Object.assign({}, { ...state.article, showBetaDisclaimer: state.ui.showBetaDisclaimer })

export default withRouter(connect(mapStateToProps)(Header))
