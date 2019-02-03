import React, { PropTypes } from 'react'
import { Radio } from 'semantic-ui-react'

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
      referencesVisible: true,
    }
  }

  getDecriptionUrl () {
    const { currentSlide } = this.props
    const thumbnailPath = currentSlide && currentSlide.media ? currentSlide.media : null

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
    return `${location.origin}/commons/File:${article.title}__${article.version}__audio__${currentSlideIndex}`
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
      <div style={{ display: 'flex', width: this.props.mode === 'viewer' ?  '58.35em' : '50em', margin: '0 auto', padding: '2rem', fontWeight: 'bold', fontSize: '1.2rem', alignItems: 'center', border: '1px solid #444', borderTop: 0, background: '#eee' }}>
        <div style={{ flex: 2 }} >
          References
        </div>
        <div style={{ flex: 1, paddingTop: '.5rem' }}>
          <Radio toggle checked={this.state.referencesVisible} onChange={(e, { checked }) => this.setState({ referencesVisible: checked })} />
        </div>
        <div style={{ flex: 10 }}>
          {this.state.referencesVisible && (
            <ul style={{ listStyle: 'none' }} >
              {decriptionUrl && (
                <li style={{ padding: '10px 0', margin: '5px 0', wordBreak: 'break-all' }} >
                  <span style={{ display: 'inline-block', width: '8%' }} >Visual - </span>
                  <a style={{ width: '90%', display: 'inline-block', verticalAlign: 'top', float: 'right' }} href={decriptionUrl} target="_blank" >{decriptionUrl}</a>
                </li>
              )}
              <li style={{ padding: '10px 0', margin: '5px 0', wordBreak: 'break-all' }} >
                <span style={{ display: 'inline-block', width: '8%' }} >Audio - </span>
                <a style={{ width: '90%', display: 'inline-block', verticalAlign: 'top', float: 'right' }} href={audioUrl} target="_blank" >{audioUrl}</a>
              </li>

              {textRefs && (
                <li style={{ padding: '10px 0', margin: '5px 0', wordBreak: 'break-all' }} >
                  <span style={{ display: 'inline-block', width: '8%' }} >Text - </span>
                  {textRefs.map((ref, index) => (
                    <p key={ref.html + index} style={{ width: '90%', display: 'inline-block', verticalAlign: 'top', float: 'right', fontSize: '12px' }} >
                      [{ref.referenceNumber}] <span dangerouslySetInnerHTML={{ __html: ref.html }} />
                    </p>
                  ))}
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    )
  }
}

EditorReferences.propTypes = {
  currentSlide: PropTypes.object.isRequired,
  currentSlideIndex: PropTypes.number.isRequired,
  article: PropTypes.object.isRequired,
  mode: PropTypes.string.isRequired,
}

export default EditorReferences
