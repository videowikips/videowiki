import _ from 'lodash'
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Search } from 'semantic-ui-react'
import { withRouter } from 'react-router'

import actions from '../../actions/WikiActionCreators'
import { getLanguageFromWikisource } from '../../utils/wikiUtils';

class WikiSearch extends Component {
  constructor (props) {
    super(props)
    this.state = {
      searchText: '',
    }

    this._resetSearchBar = this._resetSearchBar.bind(this)
    this._handleResultSelect = this._handleResultSelect.bind(this)
    this._handleSearchChange = this._handleSearchChange.bind(this)
  }

  _resetSearchBar () {
    this.props.dispatch(actions.resetSearchBar())
  }

  _handleResultSelect (e, result) {
    let { title } = result;
    const { description } = result;

    title = title.split(' ').join('_');
    console.log('lang from wikisource', description, getLanguageFromWikisource(description))
    this.props.history.push(`/${getLanguageFromWikisource(description)}/videowiki/${title}?wikiSource=${description}`)
  }

  _handleSearchChange (e, value) {
    if (this.state.searchText !== value) {
      this.setState({ searchText: value })
      _.debounce(() => {
        let { searchText } = this.state
        if (searchText.length < 1) {
          return this._resetSearchBar()
        }

        const urlRegex = /^(https:\/\/.+)\/wiki\/(.*)$/;
        const urlMatch = decodeURI(searchText).match(urlRegex);
        let wikiSource ;

        if (urlMatch && urlMatch.length == 3 ) {
          wikiSource = urlMatch[1];
          searchText = urlMatch[2];
        }

        let action = {
          searchText
        }

        if (wikiSource) {
          action['wikiSource'] = wikiSource;
        }

        this.props.dispatch(actions.searchWiki(action))
      }, 500)()
    }
  }

  render () {
    const { searchText } = this.state
    const { searchResults, isSearchResultLoading } = this.props

    return (
      <div style={{ flex: 10 }}>
        <Search
          className="c-search-bar"
          loading={isSearchResultLoading}
          onResultSelect={this._handleResultSelect}
          onSearchChange={this._handleSearchChange}
          results={searchResults}
          value={searchText}
          placeholder='Search a Topic or Paste a URL'
          fluid
        />
      </div>
    )
  }
}

WikiSearch.propTypes = {
  dispatch: PropTypes.func.isRequired,
  searchResults: PropTypes.array,
  isSearchResultLoading: PropTypes.bool,
  history: PropTypes.object.isRequired,
  language: PropTypes.string.isRequired,
}

const mapStateToProps = (state) =>
  Object.assign({}, { ...state.wiki, language: state.ui.language })
export default withRouter(connect(mapStateToProps)(WikiSearch))
