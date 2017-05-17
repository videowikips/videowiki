import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Button, Icon, Sidebar, Segment, Menu, Header, Loader, Dimmer } from 'semantic-ui-react'

import articleActions from '../../actions/ArticleActionCreators'

class Editor extends Component {
  componentWillMount () {
    const { dispatch, match } = this.props
    dispatch(articleActions.fetchArticle({ title: match.params.title }))
  }

  _render () {
    const { article } = this.props
    return (
      <div className="c-editor">
        {/* Header */}
        <div className="c-editor__toolbar">
          <span className="c-editor__toolbar-title">{ article.title }</span>
          <Button basic icon className="c-editor__toolbar-publish">
            <Icon name="save" />
          </Button>
        </div>

        {/* Sidebar */}
        <div className="c-editor__content">
          <Sidebar.Pushable as={Segment} className="c-editor__content--all">
            <Sidebar as={Menu} animation="push" width="thin" visible={true} icon="labeled" vertical inverted className="c-sidebar">
              <Menu.Item name="Overview" className="c-sidebar__menu-item"/>
              <Menu.Item name="1. Early Life" className="c-sidebar__menu-item"/>
              <Menu.Item name="childhood" className="c-sidebar__submenu-item">1.1 Early Childhood</Menu.Item>
              <Menu.Item name="university" className="c-sidebar__submenu-item">1.2 University</Menu.Item>

              <Menu.Item name="1. Early Life" className="c-sidebar__menu-item"/>
              <Menu.Item name="childhood" className="c-sidebar__submenu-item">1.1 Early Childhood</Menu.Item>
              <Menu.Item name="university" className="c-sidebar__submenu-item">1.2 University</Menu.Item>

              <Menu.Item name="1. Early Life" className="c-sidebar__menu-item"/>
              <Menu.Item name="childhood" className="c-sidebar__submenu-item">1.1 Early Childhood</Menu.Item>
              <Menu.Item name="university" className="c-sidebar__submenu-item">1.2 University</Menu.Item>
            </Sidebar>
            <Sidebar.Pusher>
              <Segment basic>
                <Header as="h3">Application Content</Header>
              </Segment>
            </Sidebar.Pusher>
          </Sidebar.Pushable>
        </div>

        {/* Footer */}

      </div>
    )
  }

  _renderLoading () {
    return (
      <Dimmer active inverted>
        <Loader size="large" active inverted>Hold tight! Loading Video Wiki Article...</Loader>
      </Dimmer>
    )
  }

  _renderFailed () {
    return (
      <div>Failed...</div>
    )
  }

  render () {
    const { fetchArticleState } = this.props
    switch (fetchArticleState) {
      case 'done':
        return this._render()
      case 'loading':
        return this._renderLoading()
      case 'failed':
        return this._renderFailed()
    }
  }
}

const mapStateToProps = (state) =>
  Object.assign({}, state.article)

export default connect(mapStateToProps)(Editor)

Editor.propTypes = {
  dispatch: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
  article: PropTypes.object,
  fetchArticleState: PropTypes.string.isRequired,
}
