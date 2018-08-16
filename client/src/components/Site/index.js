import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import {
  Route,
  Switch,
} from 'react-router-dom'

import Home from '../Home'
import VerifySignup from '../Signup/VerifySignup'
import Signup from '../Signup'
import Login from '../Login'
import Logout from '../Logout'
import ResetVerify from '../ResetPassword/ResetVerify'
import ResetPassword from '../ResetPassword'
import ResetNotify from '../ResetPassword/ResetNotify'
import Page from '../Page'
import MainEditor from '../Editor/MainEditor'
import Viewer from '../Viewer'
import Header from '../Header'
import Footer from '../Footer'
import WikiProgress from '../Wiki/WikiProgress'
import SiteNotFound from '../SiteNotFound'
import Privacy from '../Pages/Privacy'
import TermsAndConditions from '../Pages/TermsAndConditions'
import Leaderboard from '../Leaderboard'
import AllArticles from '../Articles/AllArticles'

import actions from '../../actions/AuthActionCreators'

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
            <Route exact path="/" component={Home}/>
            <Route path="/signup/verify" component={VerifySignup}/>
            <Route path="/signup" component={Signup}/>
            <Route path="/login" component={Login}/>
            <Route path="/logout" component={Logout}/>
            <Route path="/reset/:email/:token" component={ResetVerify} />
            <Route path="/reset/notify" component={ResetNotify}/>
            <Route path="/reset" component={ResetPassword}/>
            <Route path="/wiki/convert/:title*" component={WikiProgress}/>
            <Route path="/wiki/:title*" component={Page}/>
            <Route path="/videowiki/:title*" component={ Viewer }/>
            <Route path="/editor/:title*" component={MainEditor}/>
            <Route path="/leaderboard" component={Leaderboard}/>
            <Route path="/articles" component={AllArticles}/>
            {/* static pages */}
            <Route path="/privacy" component={Privacy}/>
            <Route path="/terms" component={TermsAndConditions}/>

            <Route component={SiteNotFound}/>
          </Switch>
        </div>
        <Footer />
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
