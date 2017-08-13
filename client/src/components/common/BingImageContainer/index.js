import React, { Component } from 'react'
import { Grid } from 'semantic-ui-react'

import BingSearchField from './BingSearchField'
import BingSearchResults from './BingSearchResults'

class BingImageContainer extends Component {
	constructor(props){
		super(props);
		this.state = {
			isImageTab:true
		}
	}

  render () {
    const { isImageTab } = this.state

    return (
      <div className="c-bing-container">
        <BingSearchField />
        <section className="searchControls">
        	<div className="searchFilters">
        		<ul className="searchFilterMediaType">
	      			<li
                onClick={() => this.setState({isImageTab: true})}
                className={`searchFilterMediaTypeOption ${isImageTab ? 'searchFilterMediaTypeOption--selected' : ''}`}
              >
        				<a className="searchFilterMediaTypeOption">Images</a></li>
        			<li
                onClick={() => this.setState({isImageTab: false})}
                className={`searchFilterMediaTypeOption ${!isImageTab ? 'searchFilterMediaTypeOption--selected' : ''}`}
              >
        				<a className="searchFilterMediaTypeOption">Gifs</a>
        			</li>
        		</ul> 
        	</div> 
        </section>
	      <BingSearchResults isImageTab={isImageTab} />
      </div>
    )
  }
}

export default BingImageContainer;
