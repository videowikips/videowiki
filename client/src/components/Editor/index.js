import React, { Component } from 'react'
import { Button, Icon } from 'semantic-ui-react'

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

      </div>
    )
  }
}
