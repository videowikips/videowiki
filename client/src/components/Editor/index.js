import React, { Component } from 'react'
import { Button, Icon, Sidebar, Segment, Menu, Header } from 'semantic-ui-react'

export default class Editor extends Component {
  render () {
    return (
      <div className="c-editor">
        {/* Header */}
        <div className="c-editor__toolbar">
          <span className="c-editor__toolbar-title">Elon Musk</span>
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
}
