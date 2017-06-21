import React, { Component, PropTypes } from 'react'
import { Link, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'

import WikiSearch from './WikiSearch'
import Logo from './Logo'
import AuthButtons from './AuthButtons'
import UserProfileDropdown from './UserProfileDropdown'

import actions from '../../actions/ArticleActionCreators'

class Header extends Component {
  _startPoller () {
    this._sessionPoller = setInterval(() => {
      this.props.dispatch(actions.fetchArticleCount())
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
    }
  }

  componentWillUnmount () {
    this._stopPoller()
  }

  _renderUser () {
    const { session } = this.props
    return session ? (
      <UserProfileDropdown user={ session.user } />
    ) : <AuthButtons />
  }

  _renderLeaderboard () {
    return this.props.session && this.props.session.user ? (
      <Link className="c-app-footer__link" to="/leaderboard">Leaderboard</Link>
    ) : null
  }

  _renderArticleCount () {
    const { fetchArticleCountState, articleCount } = this.props

    return fetchArticleCountState === 'done' ? (
      <div>{ `( ${articleCount} articles )` }</div>
    ) : null
  }

  _renderAllArticle () {
    return (
      <Link to="/articles" className="c-app-footer__link">
        <div>All Articles</div>
        { this._renderArticleCount() }
      </Link>
    )
  }

  render () {
    return (
      <header className="c-app__header">
        <Logo className="c-app__header__logo" match={this.props.match} />
        <WikiSearch />
        { this._renderAllArticle() }
        { this._renderLeaderboard() }
        { this._renderUser() }
      </header>
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
}

const mapStateToProps = (state) =>
  Object.assign({}, state.article)

export default withRouter(connect(mapStateToProps)(Header))
