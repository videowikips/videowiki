import React, { PropTypes } from 'react'
import { Radio, Grid } from 'semantic-ui-react'

function getUniqueSortedRefs(refs) {
  let newRefs = [];
  refs.forEach((ref) => {
    if (newRefs.map((r) => r.referenceNumber).indexOf(ref.referenceNumber) === -1) {
      newRefs.push(ref);
    }
  });

  newRefs = newRefs.sort((a, b) => a.referenceNumber - b.referenceNumber);
  return newRefs;
}

class EditorReferences extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      referencesVisible: props.defaultVisible,
    }
  }

  getDecriptionUrl () {
    const { currentSlide, currentSubmediaIndex } = this.props
    const thumbnailPath = currentSlide && currentSlide.media && currentSlide && currentSlide.media[currentSubmediaIndex] ? currentSlide.media[currentSubmediaIndex].url : null

    if (!thumbnailPath) return null

    // Check if it's a thumbnail image or not (can be a video/gif)
    if (thumbnailPath.indexOf('thumb') > -1 ) {
      const re = /(upload\.wikimedia\.org).*(commons\/thumb\/.*\/.*\/)/
      const match = thumbnailPath.match(re)
      if (match && match.length === 3) {
        const pathParts = match[2].split('/')
        // Remove trailing / character
        pathParts.pop()
        return `https://commons.wikimedia.org/wiki/File:${pathParts[pathParts.length - 1]}`
      }
    } else {
      const re = /(upload\.wikimedia\.org).*(commons\/.*\/.*)/
      const match = thumbnailPath.match(re)
      if (match && match.length === 3) {
        const pathParts = match[2].split('/')
        return `https://commons.wikimedia.org/wiki/File:${pathParts[pathParts.length - 1]}`
      }
    }

    return null
  }

  getAudioUrl () {
    const { article, currentSlideIndex } = this.props
    return `${location.origin}/${this.props.language}/commons/File:${article.title}__${article.version}__audio__${currentSlideIndex}`
  }

  getTextRefs() {
    const { article, currentSlideIndex } = this.props;
    const currentSlide = article.slides[currentSlideIndex];
    const currentSlideHtml = article.slidesHtml[currentSlideIndex];
    if (article.referencesList && currentSlide.references && currentSlide.references.length > 0) {
      return getUniqueSortedRefs(currentSlide.references.map((ref) => (
        { referenceNumber: ref.referenceNumber, html: article.referencesList[ref.referenceNumber] }
      )))
    } else if (article.referencesList && currentSlideHtml.references && currentSlideHtml.references.length > 0) {
      return getUniqueSortedRefs(currentSlideHtml.references.map((ref) => (
        { referenceNumber: ref.referenceNumber, html: article.referencesList[ref.referenceNumber] }
      )))
    }
    return null;
  }

  render () {
    const decriptionUrl = this.getDecriptionUrl();
    const audioUrl = this.getAudioUrl();
    const textRefs = this.getTextRefs();

    return (
      <div style={{ padding: '2rem', fontWeight: 'bold', fontSize: '1.2rem', border: '1px solid #444', borderTop: 0, background: '#eee' }}>
        <Grid verticalAlign="middle" centered>
          <Grid.Row>
            <Grid.Column computer={2} mobile={4}>
              References
            </Grid.Column>

            <Grid.Column computer={2} mobile={12}>
              <Radio style={{ marginTop: 5 }} toggle checked={this.state.referencesVisible} onChange={(e, { checked }) => this.setState({ referencesVisible: checked })} />
            </Grid.Column>

            <Grid.Column computer={12} mobile={16}>
              {this.state.referencesVisible && (
                <ul style={{ listStyle: 'none' }} >
                  {decriptionUrl && (
                    <li style={{ padding: '10px 0', margin: '5px 0', wordBreak: 'break-all' }} >
                      <span style={{ display: 'inline-block', width: '12%' }} >Visual - </span>
                      <a style={{ width: '88%', display: 'inline-block', verticalAlign: 'top', float: 'right' }} href={decriptionUrl} target="_blank" >{decriptionUrl}</a>
                    </li>
                  )}
                  <li style={{ padding: '10px 0', margin: '5px 0', wordBreak: 'break-all' }} >
                    <span style={{ display: 'inline-block', width: '12%' }} >Audio - </span>
                    <a style={{ width: '88%', display: 'inline-block', verticalAlign: 'top', float: 'right' }} href={audioUrl} target="_blank" >{audioUrl}</a>
                  </li>

                  {textRefs && (
                    <li className="c-editor__references-text-refs" style={{ padding: '10px 0', margin: '5px 0', wordBreak: 'break-all' }} >
                      <span style={{ display: 'inline-block', width: '12%' }} >Text - </span>
                      {textRefs.map((ref, index) => (
                        <p key={ref.html + index} style={{ width: '88%', display: 'inline-block', verticalAlign: 'top', float: 'right', fontSize: '12px' }} >
                          [{ref.referenceNumber}] <span dangerouslySetInnerHTML={{ __html: ref.html }} />
                        </p>
                      ))}
                    </li>
                  )}
                </ul>
              )}
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    )
  }
}

EditorReferences.propTypes = {
  currentSlide: PropTypes.object.isRequired,
  currentSlideIndex: PropTypes.number.isRequired,
  currentSubmediaIndex: PropTypes.number.isRequired,
  article: PropTypes.object.isRequired,
  mode: PropTypes.string.isRequired,
  language: PropTypes.string.isRequired,
  defaultVisible: PropTypes.bool,
}

EditorReferences.defaultProps = {
  defaultVisible: false,
}

export default EditorReferences
