import React from 'react';
import { Card } from 'semantic-ui-react'

class TranslateTutorial extends React.Component {
  render() {
    return (
      <div>
        <Card>
          <Card.Content>
            <Card.Header style={{ textAlign: 'center' }} >Tutorial</Card.Header>
          </Card.Content>
          <Card.Content>
            <iframe
              width="250"
              // height="315"
              src="https://www.youtube.com/embed/LZd7-AoVtCc"
              frameBorder="0"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </Card.Content>
        </Card>
      </div>
    );
  }
}

export default TranslateTutorial;
