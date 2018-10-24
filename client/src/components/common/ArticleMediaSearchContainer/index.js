import React, { Component } from 'react'
import { Grid } from 'semantic-ui-react'

import ArticleMediaSearchField from './ArticleMediaSearchField'
import ArticleMediaSearchResults from './ArticleMediaSearchResults'

class ArticleMediaSearchContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTab: 'images'
    }
  }

  render() {
    const { currentTab } = this.state

    return (
      <div className="c-bing-container">
        <ArticleMediaSearchField />
        <section className="searchControls">
          <div className="searchFilters">
            <ul className="searchFilterMediaType">
              <li
                onClick={() => this.setState({ currentTab: 'images' })}
                className={`searchFilterMediaTypeOption ${currentTab == 'images' ? 'searchFilterMediaTypeOption--selected' : ''}`}
              >
                <a className="searchFilterMediaTypeOption__link">Images</a></li>
              <li
                onClick={() => this.setState({ currentTab: 'gifs' })}
                className={`searchFilterMediaTypeOption ${currentTab == 'gifs' ? 'searchFilterMediaTypeOption--selected' : ''}`}
              >
                <a className="searchFilterMediaTypeOption__link">Gifs</a>
              </li>
              <li
                onClick={() => this.setState({ currentTab: 'videos' })}
                className={`searchFilterMediaTypeOption ${currentTab == 'videos' ? 'searchFilterMediaTypeOption--selected' : ''}`}
              >
                <a className="searchFilterMediaTypeOption__link">Videos</a>
              </li>
            </ul>
          </div>
        </section>
        <ArticleMediaSearchResults currentTab={currentTab} />
      </div>
    )
  }
}

export default ArticleMediaSearchContainer;
