import React, { Component, PropTypes } from 'react'
import { Grid } from 'semantic-ui-react'

import Editor from '../Editor'

import ArticleMediaSearchContainer from '../common/ArticleMediaSearchContainer'

class MainEditor extends Component {
  render () {
    const { match } = this.props
    return (
      <div>
        <Grid>
          <Grid.Row>
            <Grid.Column width={11}>
              <Editor
                mode="editor"
                match={match}
              />
            </Grid.Column>
            <Grid.Column width={1}>
              <div id="wrap">
              <div className="arrow"></div>  
              <div className="arrow2"></div>  
              <div className="arrow3"></div>
              </div>
            </Grid.Column>
            <Grid.Column width={4}>
              <ArticleMediaSearchContainer />
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
