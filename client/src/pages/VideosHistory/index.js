import React, { PropTypes } from 'react';
import querystring from 'querystring';

class VideosHistory extends React.Component {
  componentWillMount() {
    const { title } = this.props.match.params;
    const { wikiSource } = querystring.parse(location.search.replace('?', ''))
    console.log('=========================', title, wikiSource)
  }
  render() {
    return (
      <div style={{ display: 'flex' }} >
        <div style={{ flex: 3 }}>
          first half
        </div>
        <div style={{ flex: 1 }}>
          second half
        </div>
      </div>
    )
  }
}

VideosHistory.propTypes = {
  match: PropTypes.object.isRequired,
}

export default VideosHistory;
