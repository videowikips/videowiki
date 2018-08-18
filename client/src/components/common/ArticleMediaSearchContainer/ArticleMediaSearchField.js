import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Form } from 'semantic-ui-react'

import actions from '../../../actions/ArticleActionCreators'

class ArticleMediaSearchField extends Component {
  constructor (props) {
    super(props)
    this.state = {
      searchText: '',
    }

    this._handleSearchChange = this._handleSearchChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    
  }

  _handleSearchChange (e, { value }) {
    if (this.state.searchText !== value) {
      this.setState({ searchText: value })
    }
  }

  handleSubmit (e) {
    e.preventDefault()
    const { searchText } = this.state
    this.props.dispatch(actions.fetchImagesFromWikimediaCommons({ searchText }))
    this.props.dispatch(actions.fetchGifsFromGiphy({ searchText }))
  }

 

  render () {
    return (
       <div className="c-bing__search-bar">
        <Form onSubmit={this.handleSubmit}>
          <Form.Group>
            <Form.Input
              placeholder="Search Images"
              name="search_images"
              value={ this.state.searchText }
              onChange={this._handleSearchChange}
              icon="search"
              className="c-bing__search-input"
            />          
          </Form.Group>
        </Form>
      </div>
    
    )
  }
}

ArticleMediaSearchField.propTypes = {
  dispatch: PropTypes.func.isRequired,
  fetchImagesFromBingState: PropTypes.string,
}

const mapStateToProps = (state) =>
  Object.assign({}, state.article)
export default connect(mapStateToProps)(ArticleMediaSearchField)
  