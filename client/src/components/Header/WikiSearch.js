import _ from 'lodash'
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Search } from 'semantic-ui-react'
import { withRouter } from 'react-router'

import actions from '../../actions/WikiActionCreators'

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
    const { title } = result

    this.setState({ searchText: title })
    this.props.history.push(`/wiki/${title}`)
  }

  _handleSearchChange (e, value) {
    if (this.state.searchText !== value) {
      this.setState({ searchText: value })
      _.debounce(() => {
        const { searchText } = this.state
        if (searchText.length < 1) {
          return this._resetSearchBar()
        }

        this.props.dispatch(actions.searchWiki({ searchText }))
      }, 500)()
    }
  }

  render () {
    const { searchText } = this.state
    const { searchResults, isSearchResultLoading } = this.props

    return (
      <div>
        <Search
          className="c-search-bar"
          loading={isSearchResultLoading}
          onResultSelect={this._handleResultSelect}
          onSearchChange={this._handleSearchChange}
          results={searchResults}
          value={searchText}
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
}

const mapStateToProps = (state) =>
  Object.assign({}, state.wiki)
export default withRouter(connect(mapStateToProps)(WikiSearch))
