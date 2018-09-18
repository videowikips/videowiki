import React, { PropTypes } from 'react'
import { Radio } from 'semantic-ui-react'

class EditorReferences extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      referencesVisible: true,
    }
  }

  getDecriptionUrl() {
    const { currentSlide } = this.props
    const thumbnailPath = currentSlide && currentSlide.media ? currentSlide.media : null

    if (!thumbnailPath) return null

    const re = /(upload\.wikimedia\.org).*(commons\/thumb\/.*\/.*\/)/
    const match = thumbnailPath.match(re)
    if (match && match.length === 3) {
      const pathParts = match[2].split('/')
      // Remove trailing / character
      pathParts.pop()
      console.log(pathParts)
      return `https://commons.wikimedia.org/wiki/File:${pathParts[pathParts.length - 1]}`
    }

    return null
  }

  getAudioUrl() {
    const { article, currentSlide, currentSlideIndex } = this.props
    console.log(article, currentSlideIndex)
    return `https://commons.videowiki.org/File:${article.title}-${article.version}_audio-${currentSlideIndex}`
  }

  render() {
    const decriptionUrl = this.getDecriptionUrl()
    const audioUrl = this.getAudioUrl()

    console.log(decriptionUrl)

    return (
      <div style={{ width: '70em', maxWidth: '100%', marginLeft: '-1em', display: 'flex', padding: '2rem', fontWeight: 'bold', fontSize: '1.2rem', alignItems: 'center' }}>
        <div style={{ flex: 2 }} >
          References
        </div>
        <div style={{ flex: 1, paddingTop: '.8rem' }}>
          <Radio toggle checked={this.state.referencesVisible} onChange={(e, { checked }) => this.setState({ referencesVisible: checked })} />
        </div>
        <div style={{ flex: 10 }}>
          {this.state.referencesVisible && (
            <ol>
              {decriptionUrl && (
                <li style={{ margin: '5px 0' }} >
                  Visual - {!decriptionUrl ? 'No info available' : <a href={decriptionUrl} target="_blank" >{decriptionUrl}</a>}
                </li>
              )}
              <li style={{ margin: '5px 0' }} >
                Audio - <a href={audioUrl} target="_blank" >{audioUrl}</a>
              </li>
            </ol>
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
