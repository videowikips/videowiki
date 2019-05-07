import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import {
  Route,
  Switch,
  withRouter,
  Redirect,
} from 'react-router-dom'
import { NotificationContainer } from 'react-notifications'
import 'react-notifications/lib/notifications.css'
import { LANG_API_MAP } from '../../utils/config';
import Header from '../Header'
import Footer from '../Footer'
import LazyRoute from '../../LazyRoute';
import websockets from '../../websockets';

import actions from '../../actions/AuthActionCreators'
import uiActions from '../../actions/UIActionCreators';

const Home = () => import(/* webpackChunkName: "js/Home"  */'../Home');
const Logout = () => import(/* webpackChunkName: "js/Logout"  */ '../Logout');
const ResetVerify = () => import(/* webpackChunkName: "js/ResetVerify"  */ '../ResetPassword/ResetVerify');
const ResetNotify = () => import(/* webpackChunkName: "js/ResetNotify"  */ '../ResetPassword/ResetNotify');
const ResetPassword = () => import(/* webpackChunkName: "js/ResetPassword"  */'../ResetPassword');
const WikiProgress = () => import(/* webpackChunkName: "js/WikiProgress"  */'../Wiki/WikiProgress');
const Page = () => import(/* webpackChunkName: "js/Page"  */'../Page');
const VideowikiArticle = () => import(/* webpackChunkName: "js/Viewer"  */'../../pages/VideowikiArticle');
const EditArticle = () => import(/* webpackChunkName: "js/MainEditor"  */'../../pages/EditArticle');
const Leaderboard = () => import(/* webpackChunkName: "js/Leaderboard"  */'../Leaderboard');
const AllArticles = () => import(/* webpackChunkName: "js/AllArticles"  */'../Articles/AllArticles');
const Commons = () => import(/* webpackChunkName: "js/Commons"  */'../Commons');
const Privacy = () => import(/* webpackChunkName: "js/Privacy"  */'../Pages/Privacy');
const TermsAndConditions = () => import(/* webpackChunkName: "js/TermsAndConditions"  */'../Pages/TermsAndConditions');
const SiteNotFound = () => import(/* webpackChunkName: "js/SiteNotFound"  */'../SiteNotFound');
const VideoConvertProgress = () => import(/* webpackChunkName: "js/VideoConvertProgress" */ '../../pages/VideoConvertProgress');
const VideosHistory = () => import(/* webpackChunkName: "js/VideosHistory" */'../../pages/VideosHistory');
const ExportHumanVoice = () => import(/* webpackChunkName: "js/ExportHumanVoice" */ '../../pages/ExportHumanVoice');

class Site extends Component {
  componentWillMount () {
    this.props.dispatch(actions.validateSession());
    this.checkRouteLanguage(this.props.history.location);
    // if (routeLanguage && this.props.language)
    // Redirect any attempts to navigate with no language in the url
    // to embed the cuurent selected language
    this.unlisten = this.props.history.listen((location, action) => {
      this.checkRouteLanguage(location);
    })
  }

  checkRouteLanguage(location) {
    // If the language in the url contradicts the language in the redux store
    // change the language in the redux store
    const routeLanguage = Object.keys(LANG_API_MAP).find(lang => location.pathname.indexOf(`/${lang}`) === 0);
    if (routeLanguage && this.props.language !== routeLanguage) {
      this.props.dispatch(uiActions.setLanguage({ language: routeLanguage }));
    }
    const language = routeLanguage || this.props.language
    if (location.pathname.indexOf(`/${language}`) !== 0) {
      this.props.history.push({
        pathname: `/${language}${location.pathname}`,
        search: location.search,
        state: location.state,
      });
    }
  }

  componentDidUpdate() {
    if (!this.websocketConection && this.props.language) {
      this.websocketConection = websockets.createWebsocketConnection(LANG_API_MAP[this.props.language]);
      this.websocketConection.on('HEARTBEAT', (data) => {
        console.log('SOCKET HEARTBEAT', data);
      })
    }
  }
  componentWillUnmount() {
    if (this.unlisten) {
      this.unlisten();
    }
    if (this.websocketConection) {
      websockets.disconnectConnection();
    }
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
            <Route path="/" exact component={() => <Redirect to={`/${this.props.language}`} />} />
            <LazyRoute exact path="/:lang" title="VideoWiki" loader={Home}/>
            <LazyRoute path="/:lang/logout" loader={Logout}/>
            <LazyRoute path="/:lang/reset/:email/:token" title="Reset Password" loader={ResetVerify} />
            <LazyRoute path="/:lang/reset/notify" title="Reset Password" loader={ResetNotify}/>
            <LazyRoute path="/:lang/reset" title="Reset Password" loader={ResetPassword}/>
            <LazyRoute path="/:lang/wiki/convert/:title*" title="VideoWiki: Convert Article" loader={WikiProgress}/>
            <LazyRoute path="/:lang/wiki/:title*" loader={Page}/>
            <LazyRoute path="/:lang/VideoWiki/:title*" loader={VideowikiArticle}/>
            <LazyRoute path="/:lang/videos/progress/:id" loader={VideoConvertProgress} title="VideoWiki: Export to video progress" />
            <LazyRoute path="/:lang/videos/history/:title*" loader={VideosHistory}  title="VideoWiki: Export History" />
            <LazyRoute path="/:lang/export/humanvoice/:title*" loader={ExportHumanVoice}  title="VideoWiki: Export With Human Voice" />
            <LazyRoute path="/:lang/editor/:title*" loader={EditArticle}/>
            <LazyRoute path="/:lang/leaderboard" loader={Leaderboard}/>
            <LazyRoute path="/:lang/articles" title="All Articles" loader={AllArticles}/>
            <LazyRoute path="/:lang/commons/:file*" loader={Commons}/>
            {/* static pages */}
            <Route path="/:lang/privacy" loader={Privacy}/>
            <Route path="/:lang/terms" loader={TermsAndConditions}/>

            <LazyRoute title="VideoWiki: 404 Not found" loader={SiteNotFound}/>
          </Switch>
        </div>
        <Footer language={this.props.language} />
        <NotificationContainer/>
      </div>
    )
  }
}

const mapStateToProps = (state) =>
  Object.assign({}, { ...state.auth, language: state.ui.language })
export default withRouter(connect(mapStateToProps)(Site))

Site.propTypes = {
  dispatch: PropTypes.func.isRequired,
  match: PropTypes.object,
  session: PropTypes.object,
}
