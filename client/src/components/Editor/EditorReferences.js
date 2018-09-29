import React, { PropTypes } from 'react'
import { Radio } from 'semantic-ui-react'

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
    return `/commons/File:${article.title}-${article.version}-audio-${currentSlideIndex}`
  }

  render () {
    const decriptionUrl = this.getDecriptionUrl()
    const audioUrl = this.getAudioUrl()

    return (
      <div style={{ display: 'flex', width: '58.35em', marginLeft: '-.85em', padding: '2rem', fontWeight: 'bold', fontSize: '1.2rem', alignItems: 'center', border: '1px solid #444', borderTop: 0, background: '#eee' }}>
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
                <li style={{ margin: '5px 0', wordBreak: 'break-all' }} >
                  <span style={{ display: 'inline-block', width: '8%' }} >Visual -</span>
                  <a style={{ width: '90%', display: 'inline-block', verticalAlign: 'top' }} href={decriptionUrl} target="_blank" >{decriptionUrl}</a>
                </li>
              )}
              <li style={{ margin: '5px 0', wordBreak: 'break-all' }} >
                <span style={{ display: 'inline-block', width: '8%' }} >Audio -</span>
                <a style={{ width: '90%', display: 'inline-block', verticalAlign: 'top' }} href={audioUrl} target="_blank" >{audioUrl}</a>
              </li>
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
}

export default EditorReferences
