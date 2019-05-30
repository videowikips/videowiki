import React, { PropTypes } from 'react';
import { PlayButton, Timer, VolumeControl, Progress } from 'react-soundplayer/components';
import { withCustomAudio } from 'react-soundplayer/addons';
import 'react-soundplayer/styles/buttons.css';
import 'react-soundplayer/styles/icons.css'
import 'react-soundplayer/styles/progress.css'
import 'react-soundplayer/styles/volume.css'

class ProgressSoundPlayer extends React.Component {
  componentDidMount() {
    this.mounted = true;
    if (this.props.soundCloudAudio) {
      this.props.soundCloudAudio.on('seeked', () => {
        if (this.mounted) {
          this.props.onSeekEnd(this.props.currentTime)
        }
      })
      this.props.soundCloudAudio.on('loadedmetadata', () => {
        this.props.onAudioLoad();
        if (this.props.isPlaying) {
          this.props.soundCloudAudio.play();
        }
      });
    }
  }
  componentWillUnmount() {
    this.mounted = false;
    if (this.props.soundCloudAudio && this.props.soundCloudAudio.unbindAll) {
      this.props.soundCloudAudio.unbindAll();
    }
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.isPlaying !== nextProps.isPlaying && this.props.soundCloudAudio) {
      if (nextProps.isPlaying) {
        this.props.soundCloudAudio.play();
      } else {
        this.props.soundCloudAudio.pause();
      }
    }
  }
  render() {
    return (
      <div className="bg-darken-1 red mb3 rounded">
        <div>
          <div className="ml2">
            <Timer
              className="h6 mr1 regular"
              {...this.props}
              key={`progress-player-time-${this.props.streamUrl}`}
            />
          </div>
          <div className="flex flex-center">
            {/* <PlayButton
              className="flex-none h5 button button-transparent button-grow rounded"
              {...this.props}
              key={`progress-player-play-${this.props.streamUrl}`}
            />
            <VolumeControl
              className="flex flex-center mr2"
              buttonClassName="flex-none h5 button button-transparent button-grow rounded"
              {...this.props}
            /> */}
            <Progress
              className="rounded"
              style={{ marginTop: '1.5rem' }}
              innerClassName="rounded-left"
              {...this.props}
              key={`progress-playe-progressr-${this.props.streamUrl}`}
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
  streamUrl: PropTypes.string.isRequired,
  soundCloudAudio: PropTypes.object.isRequired,
  isPlaying: PropTypes.bool,
  onAudioLoad: PropTypes.func.isRequired,
  currentTime: PropTypes.number.isRequired,
  onSeekEnd: PropTypes.func,
};

ProgressSoundPlayer.defaultProps = {
  isPlaying: false,
  onSeekEnd: () => {},
}

export default withCustomAudio(ProgressSoundPlayer);
