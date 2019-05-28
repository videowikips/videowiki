import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Grid } from 'semantic-ui-react';
// import { NotificationManager } from 'react-notifications';
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
      viewerMode: 'player',
    }
  }

  componentWillMount() {
    const { dispatch, match } = this.props
    const { wikiSource, viewerMode } = queryString.parse(location.search);
    if (viewerMode && viewerMode === 'editor') {
      this.setState({ viewerMode });
    } else {
      this.setState({ viewerMode: 'player' });
    }
    dispatch(articleActions.fetchArticle({ title: match.params.title, mode: 'viewer', wikiSource }))
    console.log('component did mout ========================================== ')
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.fetchArticleState === 'loading' && nextProps.fetchArticleState === 'done') {
      if (nextProps.article && nextProps.article._id) {
        const { wikiSource } = queryString.parse(location.search);
        if ((!wikiSource || wikiSource === undefined || wikiSource === 'undefined') && nextProps.article.wikiSource) {
          this.props.history.push(`/${this.props.language}/videowiki/${nextProps.article.title}?wikiSource=${nextProps.article.wikiSource}`);
        } else {
          const { article } = nextProps;
          const { title, version, wikiSource, lang } = article;
          this.props.dispatch(articleActions.fetchArticleVideoByArticleVersion({ title, version, wikiSource, lang }));
          this.props.dispatch(articleActions.fetchVideoByArticleTitle({ title: article.title, wikiSource: article.wikiSource, lang }));
          // const { notification } = queryString.parse(location.search);
          // if ((!notification || notification === false)) {
          //   setTimeout(() => {
          //     NotificationManager.info('Drag and Drop images/gifs/videos to the article by clicking on the edit button', '', 4000);
          //   }, 1000);
          // }
        }
      } else if (nextProps.article && nextProps.article.redirect) {
        console.log('redirect request', nextProps.article);
        return this.props.history.push(`/${this.props.language}/videowiki/${nextProps.article.title}?wikiSource=${nextProps.article.wikiSource}`);
      }
    }
    if (this.props.fetchArticleState === 'loading' && nextProps.fetchArticleState === 'done' && (!nextProps.article || !nextProps.article._id)) {
      const { match, language } = this.props
      const { wikiSource } = queryString.parse(location.search);
      return this.props.history.push(`/${language}/wiki/${match.params.title}?wikiSource=${wikiSource}`);
    }
  }

  onViewerModeChange(viewerMode) {
    const update = {
      viewerMode,
    }
    if (viewerMode === 'editor') {
      update.autoPlay = false;
    }
    console.log('viewer mode change', update)
    this.setState(update);
  }

  _render () {
    const { match, article } = this.props;
    if (!article) return <div>Loading...</div>;

    return (
      <div>
        <Grid>
          <Grid.Row>
            <Grid.Column computer={12} mobile={16}>
            {this.props.article && this.props.article._id && (
              <Editor
                mode="viewer"
                viewerMode={this.state.viewerMode}
                onViewerModeChange={this.onViewerModeChange.bind(this)}
                match={match}
                autoPlay
                showOptions
                showReferences
                article={this.props.article}
                fetchArticleVideoState={this.props.fetchArticleVideoState}
                articleVideo={this.props.articleVideo}
                articleLastVideo={this.props.articleLastVideo}
              />
              )}
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
  articleVideo: {},
  articleLastVideo: {},
}

VideowikiArticle.propTypes = {
  match: PropTypes.object.isRequired,
  article: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
  fetchArticleState: PropTypes.string.isRequired,
  fetchArticleVideoState: PropTypes.string.isRequired,
  articleVideo: PropTypes.object,
  articleLastVideo: PropTypes.object,
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
    articleLastVideo: article.articleLastVideo,
    language: ui.language,
  })

export default withRouter(connect(mapStateToProps)(VideowikiArticle));
