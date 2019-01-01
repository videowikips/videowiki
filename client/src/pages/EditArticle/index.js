import React, { Component, PropTypes } from 'react'
import { Grid } from 'semantic-ui-react';
import { connect } from 'react-redux';
import queryString from 'querystring';

import Editor from '../../components/Editor'
import StateRenderer from '../../components/common/StateRenderer';

import ArticleMediaSearchContainer from '../../components/common/ArticleMediaSearchContainer'
import articleActions from '../../actions/ArticleActionCreators';

class EditArticle extends Component {
  componentWillMount() {
    const { dispatch, match } = this.props
    const { wikiSource } = queryString.parse(location.search);

    dispatch(articleActions.fetchArticle({ title: match.params.title, mode: 'editor', wikiSource }))
  }

  _render () {
    const { match } = this.props
    return (
      <div>
        <Grid>
          <Grid.Row>
            <Grid.Column width={11}>
              <Editor
                {...this.props}
                mode="editor"
                editable
                autoPlay
                showOptions
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

  render() {
    const { fetchArticleState } = this.props
    return (
      <StateRenderer
        componentState={fetchArticleState}
        loaderImage="/img/edit-loader.gif"
        loaderMessage="Editing the sum of all human knowledge!"
        errorMessage="Error while loading article! Please try again later!"
        onRender={() => this._render()}
      />
    )
  }
}

EditArticle.propTypes = {
  match: PropTypes.object.isRequired,
  article: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
  fetchArticleState: PropTypes.string.isRequired,
}

const mapStateToProps = ({ article }) =>
  Object.assign({}, article)

export default connect(mapStateToProps)(EditArticle);
