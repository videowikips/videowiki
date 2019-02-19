import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
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
    console.log('component did mout ========================================== ')
  }

  componentDidMount() {
    const { notification } = queryString.parse(location.search);
    if ((!notification || notification === false)) {
      setTimeout(() => {
        NotificationManager.info('Drag and Drop images/gifs/videos to the article by clicking on the edit button', '', 4000);
      }, 1000);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.fetchArticleState === 'loading' && nextProps.fetchArticleState === 'done' && nextProps.article && nextProps.article._id) {
      const { wikiSource } = queryString.parse(location.search);
      if ((!wikiSource || wikiSource === undefined || wikiSource === 'undefined') && nextProps.article.wikiSource) {
        this.props.history.push(`/${this.props.language}/videowiki/${nextProps.article.title}?wikiSource=${nextProps.article.wikiSource}`);
      } else {
        this.props.dispatch(articleActions.fetchArticleVideo(nextProps.article._id));
      }
    }
  }

  _render () {
    const { match } = this.props;
    return (
      <div>
        <Grid>
          <Grid.Row>
            <Grid.Column computer={12} mobile={16}>
              <Editor
                mode="viewer"
                match={match}
                autoPlay
                showOptions
                article={this.props.article}
                fetchArticleVideoState={this.props.fetchArticleVideoState}
                articleVideo={this.props.articleVideo}
              />
            </Grid.Column>
            <Grid.Column computer={4} mobile={16}>
              <div className="c-editor-infobox-container" >
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

VideowikiArticle.defaultProps = {
  article: {},
}

VideowikiArticle.propTypes = {
  match: PropTypes.object.isRequired,
  article: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
  fetchArticleState: PropTypes.string.isRequired,
  fetchArticleVideoState: PropTypes.string.isRequired,
  articleVideo: PropTypes.object,
  language: PropTypes.string.isRequired,
  history: PropTypes.object.isRequired,
}

VideowikiArticle.defaultProps = {
  articleVideo: {
    video: {},
    exported: false,
  },
}

const mapStateToProps = ({ article, ui }) =>
  Object.assign({}, {
    fetchArticleState: article.fetchArticleState,
    article: article.article,
    fetchArticleVideoState: article.fetchArticleVideoState,
    articleVideo: article.articleVideo,
    language: ui.language,
  })

export default withRouter(connect(mapStateToProps)(VideowikiArticle));
