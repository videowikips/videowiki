import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Grid } from 'semantic-ui-react';
import queryString from 'query-string';

import Editor from '../../components/Editor';
import StateRenderer from '../../components/common/StateRenderer';
import articleActions from '../../actions/ArticleActionCreators';

class ExportHumanVoice extends React.Component {

  componentWillMount() {
    const { title } = this.props.match.params;
    const { wikiSource } = queryString.parse(location.search);
    console.log('fetching article ===================================== ', title, wikiSource)
    this.props.dispatch(articleActions.fetchArticle({ title, wikiSource }));
  }

  _render() {
    return (
      <div>
        <Grid>
          <Grid.Row>
            <Grid.Column computer={12} mobile={16}>
              <Editor
                mode="editor"
                article={this.props.article}
                match={this.props.match}
              />
            </Grid.Column>
            <Grid.Column computer={4} mobile={16}>
              <div>
                RIght Grid
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    )
  }

  render() {
    const { fetchArticleState } = this.props;
    return (
      <StateRenderer
        componentState={fetchArticleState}
        loaderImage="/img/view-loader.gif"
        loaderMessage="Loading your article from the sum of all human knowledge!"
        errorMessage="Error while loading article! Please try again later!"
        onRender={() => this._render()}
      />
    )
  }
}

const mapStateToProps = ({ article }) =>
  Object.assign({}, { article: article.article, fetchArticleState: article.fetchArticleState });

ExportHumanVoice.propTypes = {
  match: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  fetchArticleState: PropTypes.string.isRequired,
  article: PropTypes.object,
}

ExportHumanVoice.defaultProps = {
  article: {},
}

export default connect(mapStateToProps)(withRouter(ExportHumanVoice));
