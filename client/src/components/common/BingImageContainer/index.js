import React, { Component } from 'react'
import { Grid } from 'semantic-ui-react'

import BingSearchField from './BingSearchField'
import BingSearchResults from './BingSearchResults'

class BingImageContainer extends Component {
	constructor(props){
		super(props);
		this.state = {
			images:true
		}
	}

  render () {
  	let selectedType;
  	let selectedType2;
  	if(this.state.images){
  		selectedType="searchFilterMediaTypeOption--selected"
  	}else{
  		selectedType2="searchFilterMediaTypeOption--selected"
  	}
    return (
      <div className="c-bing-container">
        <BingSearchField />
        <section className="searchControls"> 
        	<div className="searchFilters"> 
        		<ul className="searchFilterMediaType"> 
	      			<li onClick={() => this.setState({images: true})} className={"searchFilterMediaTypeOption" + selectedType}>
        				<a className="searchFilterMediaTypeOption">Images</a></li>
        			<li onClick={() => this.setState({images: false})} className={"searchFilterMediaTypeOption" + selectedType2}>
        				<a className="searchFilterMediaTypeOption">Gifs</a>
        			</li>
        		</ul> 
        	</div> 
        </section>
	    <BingSearchResults images={this.state.images} />
      </div>
    )
  }
}

export default BingImageContainer;
