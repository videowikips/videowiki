import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'

import WikiSearch from './WikiSearch'
import Logo from './Logo'
import AuthButtons from './AuthButtons'
import UserProfileDropdown from './UserProfileDropdown'

import actions from '../../actions/ArticleActionCreators'

class Header extends Component {
  componentWillMount () {
    this.props.dispatch(actions.fetchArticleCount())
  }

  componentWillReceiveProps (nextProps) {
    console.log(this.props.match)
    console.log(nextProps.match)
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
}

const mapStateToProps = (state) =>
  Object.assign({}, state.article)

export default connect(mapStateToProps)(Header)
