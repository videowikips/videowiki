import React, { Component, PropTypes } from 'react'
import { Grid } from 'semantic-ui-react'

import Editor from '../Editor'

import BingImageContainer from '../common/BingImageContainer'

class MainEditor extends Component {
  render () {
    const { match } = this.props
    return (
      <div>
        <Grid>
          <Grid.Row>
            <Grid.Column width={12}>
              <Editor
                mode="editor"
                match={match}
              />
            </Grid.Column>
            <Grid.Column width={4}>
              <BingImageContainer />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    )
  }
}

MainEditor.propTypes = {
  match: PropTypes.object.isRequired,
}

export default MainEditor
