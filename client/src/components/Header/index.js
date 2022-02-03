import React, { Component, PropTypes } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Popup, Icon, Dropdown } from 'semantic-ui-react';

import WikiSearch from './WikiSearch';
import Logo from './Logo';
import AuthButtons from './AuthButtons';
import UserProfileDropdown from './UserProfileDropdown';

import actions from '../../actions/ArticleActionCreators';
import authActions from '../../actions/AuthActionCreators';
import uiActions from '../../actions/UIActionCreators';

const LANG_OPTIONS = [
  {
    text: 'MDWiki ( English )',
    value: 'md-en',
    key: 'md-en',
  },
  {
    text: 'EN ( English )',
    value: 'en',
    key: 'en',
  },
  {
    text: 'HI ( हिंदी )',
    value: 'hi',
    key: 'hi',
  },
  {
    text: 'ES ( Español )',
    value: 'es',
    key: 'es',
  },
  {
    text: 'AR ( العربية )',
    value: 'ar',
    key: 'ar',
  },
  {
    text: 'JA ( 日本人 )',
    value: 'ja',
    key: 'ja',
  },
  {
    text: 'UK ( Ukrainian )',
    value: 'uk',
    key: 'uk',
  },
  {
    text: 'FR ( Française )',
    value: 'fr',
    key: 'fr',
  },
  {
    text: 'OR (Odia)',
    value: 'or',
    key: 'or',
  },
  {
    text: 'TE (Telegu)',
    value: 'te',
    key: 'te',
  },
  {
    text: 'GU (Gujarati)',
    value: 'gu',
    key: 'gu',
  },
  {
    text: 'BN (Bengali)',
    value: 'bn',
    key: 'bn',
  },
  {
    text: 'SAT (Santali)',
    value: 'sat',
    key: 'sat',
  },
  {
    text: 'PA (Punjabi)',
    value: 'pa',
    key: 'pa',
  },
  {
    text: 'SV ( Svenska )',
    value: 'sv',
    key: 'sv',
  },
  {
    text: 'IT ( Italian )',
    value: 'it',
    key: 'it',
  },
  {
    text: 'KN ( Kannada )',
    value: 'kn',
    key: 'kn',
  },
  {
    text: 'ML ( Malayalam )',
    value: 'ml',
    key: 'ml',
  },
  {
    text: 'TA ( Tamil )',
    value: 'ta',
    key: 'ta',
  },
];

const styles = {
  disclaimerContainer: {
    textAlign: 'center',
    margin: 0,
    padding: 10,
    backgroundColor: '#0099ff',
  },
  disclaimerTrigger: {
    color: 'white',
    fontWeight: 'bold',
    textDecoration: 'underline',
  },
  disclaimerContent: {
    textAlign: 'left',
    fontSize: 16,
  },
  disclaimerClose: {
    position: 'absolute',
    right: 30,
    color: 'white',
    fontWeight: 'bold',
  },
};

class Header extends Component {
  _startPoller() {
    this._sessionPoller = setInterval(() => {
      this.props.dispatch(actions.fetchArticleCount(this.props.wiki));
      this.props.dispatch(authActions.validateSession());
    }, 60000);
  }

  _stopPoller() {
    clearInterval(this._sessionPoller);
    this._sessionPoller = null;
  }

  componentWillMount() {
    this.props.dispatch(actions.fetchArticleCount(this.props.wiki));
    this._startPoller();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.location.pathname !== nextProps.location.pathname) {
      this.props.dispatch(actions.fetchArticleCount(this.props.wiki));
      this.props.dispatch(authActions.validateSession());
    }
  }

  componentWillUnmount() {
    this._stopPoller();
  }

  onCloseDisclaimer() {
    this.props.dispatch(uiActions.closeBetaDisclaimer());
  }

  _renderBetaDisclaimer() {
    if (!this.props.showBetaDisclaimer) return;

    return (
      <p style={styles.disclaimerContainer}>
        <Popup
          wide='very'
          position='bottom center'
          trigger={
            <a href='javascript:void(0)' style={styles.disclaimerTrigger}>
              Read the Beta Disclaimer
            </a>
          }
          content={
            <div style={styles.disclaimerContent}>
              <p>
                <strong>VideoWiki</strong> is a proof of concept for a tool that
                allows you to collaboratively create and edit videos by dragging
                and dropping images and videos from Wikimedia Commons to
                relevant Wikipedia text.
              </p>
              <p>
                VideoWiki is currently in Beta stage and despite our progress,
                we have only scratched the surface. We are actively working
                towards adding many more features and additional functionality.
                Anyone, including yourself, can edit a VideoWiki article even
                without logging in. Your user name (if you use one) or IP
                address will be associated with your edits.
              </p>
            </div>
          }
        />
        <a
          style={styles.disclaimerClose}
          onClick={this.onCloseDisclaimer.bind(this)}
        >
          <Icon name='close' />
        </a>
      </p>
    );
  }

  onLanguageSelect(e, { value }) {
    let isMDwiki = false;

    if (value === 'md-en') {
      isMDwiki = true;
      value = 'en';
    }

    if (this.props.language !== value || (isMDwiki && !this.props.wiki) || (!isMDwiki && this.props.wiki === 'mdwiki')) {
      this.props.dispatch(uiActions.setLanguage(value));
      if (!isMDwiki) {
        this.props.dispatch(uiActions.setWiki(undefined));
      } else {
        this.props.dispatch(uiActions.setWiki('mdwiki'));
      }

      setTimeout(() => {
        window.location.assign(window.location.origin);
      }, 500);
    }
  }

  _renderLanguages() {
    return (
      <Dropdown
        inline
        placeholder='Language'
        className={'select-lang-dropdown'}
        value={this.props.wiki === 'mdwiki' ? 'md-en' : this.props.language}
        options={LANG_OPTIONS}
        onChange={this.onLanguageSelect.bind(this)}
      />
    );
  }

  _renderUser() {
    const { session } = this.props;
    return session && session.user ? (
      <UserProfileDropdown user={session.user} />
    ) : (
      <AuthButtons
        style={{ maxWidth: '10rem', lineHeight: '20px', padding: '.5rem' }}
      />
    );
  }

  // _renderLeaderboard () {
  //   return this.props.session && this.props.session.user
  //   ? null
  //   : (
  //     <Link className="c-app-header__link" to="/leaderboard">Leaderboard</Link>
  //   )
  // }

  _renderArticleCount() {
    const { fetchArticleCountState, articleCount } = this.props;

    return fetchArticleCountState === 'done' ? (
      <div>{`( ${articleCount} articles )`}</div>
    ) : null;
  }

  _renderAllArticle() {
    return (
      <Link
        to={`/${this.props.language}/articles`}
        className='c-app-header__link'
      >
        <div>All Articles</div>
        {this._renderArticleCount()}
      </Link>
    );
  }

  _renderWikiScripts() {
    const { wiki, language } = this.props
    let href = ''
    if (wiki && wiki === 'mdwiki' && language === 'en') {
      href = 'https://mdwiki.org/wiki/Category:Videowiki_scripts'
    } else if (language === 'en') {
      href = 'https://en.wikipedia.org/wiki/Category:Videowiki_scripts'
    } else {
      return null
    }

    return (
      <a href={href} target='_blank' className='c-app-header__link'>
        Video Scripts
      </a>
    )
  }

  render() {
    return (
      <div>
        {this._renderBetaDisclaimer()}
        <header className='c-app__header'>
          <Logo className='c-app__header__logo' match={this.props.match} />
          <WikiSearch />
          {this._renderAllArticle()}
          {/* { this._renderLeaderboard() } */}
          {this._renderLanguages()}
          {this._renderWikiScripts()}
          {this._renderUser()}
        </header>
      </div>
    );
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
  language: PropTypes.string.isRequired,
  wiki: PropTypes.string,
};

const mapStateToProps = (state) =>
  Object.assign(
    {},
    {
      ...state.article,
      showBetaDisclaimer: state.ui.showBetaDisclaimer,
      language: state.ui.language,
      wiki: state.ui.wiki,
    },
  );

export default withRouter(connect(mapStateToProps)(Header));
