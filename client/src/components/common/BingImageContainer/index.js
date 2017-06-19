import React, { Component } from 'react'
import { Grid } from 'semantic-ui-react'

import BingSearchField from './BingSearchField'
import BingSearchResults from './BingSearchResults'

class BingImageContainer extends Component {
  render () {
    return (
      <div className="c-bing-container">
        <BingSearchField />
        <BingSearchResults />
      </div>
    )
  }
}

export default BingImageContainer
