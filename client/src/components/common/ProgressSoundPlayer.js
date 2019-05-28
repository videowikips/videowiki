import React, { PropTypes } from 'react';
import { PlayButton, Timer, VolumeControl, Progress } from 'react-soundplayer/components';
import { withCustomAudio } from 'react-soundplayer/addons';
import 'react-soundplayer/styles/buttons.css';
import 'react-soundplayer/styles/icons.css'
import 'react-soundplayer/styles/progress.css'
import 'react-soundplayer/styles/volume.css'

class ProgressSoundPlayer extends React.Component {
  render() {
    return (
      <div className="bg-darken-1 red mt1 mb3 rounded">
        <div className="pt2">
          <div className="ml2">
            <Timer className="h6 mr1 regular" {...this.props} />
          </div>
          <div className="flex flex-center">
            <PlayButton
              className="flex-none h5 button button-transparent button-grow rounded"
              {...this.props}
            />
            <VolumeControl
              className="flex flex-center mr2"
              buttonClassName="flex-none h5 button button-transparent button-grow rounded"
              {...this.props}
            />
            <Progress
              className="rounded"
              style={{ marginTop: '1.5rem' }}
              innerClassName="rounded-left"
              {...this.props}
            />

          </div>
        </div>
      </div>
    );
  }
}

ProgressSoundPlayer.propTypes = {
  resolveUrl: PropTypes.string.isRequired,
  clientId: PropTypes.string.isRequired,
};

export default withCustomAudio(ProgressSoundPlayer);
