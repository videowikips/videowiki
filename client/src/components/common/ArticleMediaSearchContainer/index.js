import React, { Component } from 'react'
import { Grid } from 'semantic-ui-react'

import ArticleMediaSearchField from './ArticleMediaSearchField'
import ArticleMediaSearchResults from './ArticleMediaSearchResults'

class ArticleMediaSearchContainer extends Component {
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
        <ArticleMediaSearchField />
        <section className="searchControls">
        	<div className="searchFilters">
        		<ul className="searchFilterMediaType">
	      			<li
                onClick={() => this.setState({isImageTab: true})}
                className={`searchFilterMediaTypeOption ${isImageTab ? 'searchFilterMediaTypeOption--selected' : ''}`}
              >
        				<a className="searchFilterMediaTypeOption__link">Images</a></li>
        			<li
                onClick={() => this.setState({isImageTab: false})}
                className={`searchFilterMediaTypeOption ${!isImageTab ? 'searchFilterMediaTypeOption--selected' : ''}`}
              >
        				<a className="searchFilterMediaTypeOption__link">Gifs</a>
        			</li>
        		</ul> 
        	</div> 
        </section>
	      <ArticleMediaSearchResults isImageTab={isImageTab} />
      </div>
    )
  }
}

export default ArticleMediaSearchContainer;
