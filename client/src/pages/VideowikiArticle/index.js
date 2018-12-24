import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Grid } from 'semantic-ui-react';
import { NotificationManager } from 'react-notifications';
import queryString from 'query-string';

import Editor from '../../components/Editor';
import Contributors from '../../components/common/Contributors';
import InfoBox from '../../components/common/InfoBox';
import StateRenderer from '../../components/common/StateRenderer';

import articleActions from '../../actions/ArticleActionCreators';

class VideowikiArticle extends Component {
  constructor(props) {
    super(props);
    const { wikiSource } = queryString.parse(location.search);
    this.state = {
      wikiSource,
    }
  }

  componentWillMount() {
    const { dispatch, match } = this.props
    const { wikiSource } = queryString.parse(location.search);

    dispatch(articleActions.fetchArticle({ title: match.params.title, mode: 'viewer', wikiSource }))
  }

  componentDidMount() {
    const { notification } = queryString.parse(location.search);
    if ((!notification || notification === false)) {
      setTimeout(() => {
        NotificationManager.info('Drag and Drop images/gifs/videos to the article by clicking on the edit button', '', 4000);
      }, 1000);
    }
  }

  _render () {
    const { match } = this.props;
    return (
      <div>
        <Grid>
          <Grid.Row>
            <Grid.Column width={12}>
              <Editor
                mode="viewer"
                match={match}
                autoPlay
                showOptions
                article={this.props.article}
              />
            </Grid.Column>
            <Grid.Column width={4}>
              <Contributors
                title={match.params.title}
              />
              {
                this.state.wikiSource &&
                <InfoBox
                  title={match.params.title}
                  titleWikiSource={this.state.wikiSource}
                />
              }
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

VideowikiArticle.defaultProps = {
  article: {},
}

VideowikiArticle.propTypes = {
  match: PropTypes.object.isRequired,
  article: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
  fetchArticleState: PropTypes.string.isRequired,
}

const mapStateToProps = ({ article }) =>
  Object.assign({}, { article: article.article, fetchArticleState: article.fetchArticleState })

export default connect(mapStateToProps)(VideowikiArticle);
