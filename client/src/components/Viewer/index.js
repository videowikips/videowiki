import React, { Component, PropTypes } from 'react'
import { Grid } from 'semantic-ui-react'
import queryString from 'query-string';

import Editor from '../Editor'
import Contributors from '../common/Contributors'
import InfoBox from '../common/InfoBox'

class Viewer extends Component {
  render () {
    const { match } = this.props;
    const { wikiSource } = queryString.parse(location.search);    
    
    return (
      <div>
        <Grid>
          <Grid.Row>
            <Grid.Column width={12}>
              <Editor
                mode="viewer"
                match={match}
              />
            </Grid.Column>
            <Grid.Column width={4}>
              <Contributors
                title={match.params.title}
              />
              <InfoBox
                title={match.params.title}
                wikiSource={wikiSource}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    )
  }
}

Viewer.propTypes = {
  match: PropTypes.object.isRequired,
}

export default Viewer
