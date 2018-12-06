import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import {
  Route,
  Switch,
} from 'react-router-dom'
import { NotificationContainer } from 'react-notifications'
import 'react-notifications/lib/notifications.css'
import Header from '../Header'
import Footer from '../Footer'
import LazyRoute from '../../LazyRoute';

import actions from '../../actions/AuthActionCreators'

const Home = () => import(/* webpackChunkName: "js/Home"  */'../Home');
const Logout = () => import(/* webpackChunkName: "js/Logout"  */ '../Logout');
const ResetVerify = () => import(/* webpackChunkName: "js/ResetVerify"  */ '../ResetPassword/ResetVerify');
const ResetNotify = () => import(/* webpackChunkName: "js/ResetNotify"  */ '../ResetPassword/ResetNotify');
const ResetPassword = () => import(/* webpackChunkName: "js/ResetPassword"  */'../ResetPassword');
const WikiProgress = () => import(/* webpackChunkName: "js/WikiProgress"  */'../Wiki/WikiProgress');
const Page = () => import(/* webpackChunkName: "js/Page"  */'../Page');
const Viewer = () => import(/* webpackChunkName: "js/Viewer"  */'../Viewer');
const MainEditor = () => import(/* webpackChunkName: "js/MainEditor"  */'../Editor/MainEditor');
const Leaderboard = () => import(/* webpackChunkName: "js/Leaderboard"  */'../Leaderboard');
const AllArticles = () => import(/* webpackChunkName: "js/AllArticles"  */'../Articles/AllArticles');
const Commons = () => import(/* webpackChunkName: "js/Commons"  */'../Commons');
const Privacy = () => import(/* webpackChunkName: "js/Privacy"  */'../Pages/Privacy');
const TermsAndConditions = () => import(/* webpackChunkName: "js/TermsAndConditions"  */'../Pages/TermsAndConditions');
const SiteNotFound = () => import(/* webpackChunkName: "js/SiteNotFound"  */'../SiteNotFound');

class Site extends Component {
  componentWillMount () {
    this.props.dispatch(actions.validateSession())
  }

  render () {
    const { match, session } = this.props
    // the * in title param to handle articles having "/"" in their titles
    // https://github.com/ReactTraining/react-router/issues/313#issuecomment-261403303
    return (
      <div className="c-app">
        <Header match={ match } session={ session }/>
        <div className="c-app__main">
          <Switch>
            <LazyRoute exact path="/" title="VideoWiki" loader={Home}/>
            <LazyRoute path="/logout" loader={Logout}/>
            <LazyRoute path="/reset/:email/:token" title="Reset Password" loader={ResetVerify} />
            <LazyRoute path="/reset/notify" title="Reset Password" loader={ResetNotify}/>
            <LazyRoute path="/reset" title="Reset Password" loader={ResetPassword}/>
            <LazyRoute path="/wiki/convert/:title*" title="VideoWiki: Convert Article" loader={WikiProgress}/>
            <LazyRoute path="/wiki/:title*" loader={Page}/>
            <LazyRoute path="/VideoWiki/:title*" loader={Viewer}/>
            
            <LazyRoute path="/editor/:title*" loader={MainEditor}/>
            <LazyRoute path="/leaderboard" loader={Leaderboard}/>
            <LazyRoute path="/articles" title="All Articles" loader={AllArticles}/>
            <LazyRoute path="/commons/:file*" loader={Commons}/>
            {/* static pages */}
            <Route path="/privacy" loader={Privacy}/>
            <Route path="/terms" loader={TermsAndConditions}/>

            <Route loader={SiteNotFound}/>
          </Switch>
        </div>
        <Footer />
        <NotificationContainer/>
      </div>
    )
  }
}

const mapStateToProps = (state) =>
  Object.assign({}, state.auth)
export default connect(mapStateToProps)(Site)

Site.propTypes = {
  dispatch: PropTypes.func.isRequired,
  match: PropTypes.object,
  session: PropTypes.object,
}
