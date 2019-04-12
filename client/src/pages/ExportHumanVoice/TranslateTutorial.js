import React from 'react';
import { Card } from 'semantic-ui-react'

class TranslateTutorial extends React.Component {
  render() {
    return (
      <Card style={{ margin: 0, width: '100%', height: '100%' }} >
        <Card.Content style={{ maxHeight: '3rem', height: '2rem' }} >
          <Card.Header style={{ textAlign: 'center' }} >Tutorial</Card.Header>
        </Card.Content>
        <Card.Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} >
          <iframe
            width="100%"
            // height="315"
            src="https://www.youtube.com/embed/LZd7-AoVtCc"
            frameBorder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </Card.Content>
      </Card>
    );
  }
}

export default TranslateTutorial;
