import React, { PropTypes } from 'react';
import WaveStream from 'react-wave-stream';
import Recorder from 'recorder-js';
import { NotificationManager } from 'react-notifications';
// shim for AudioContext when it's not avb.
window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
const AudioContext = window.AudioContext || window.webkitAudioContext;

function getBrowserUserMedia() {
  let userMediaFunc;
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    userMediaFunc = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
  } else {
    userMediaFunc = (navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia).bind(navigator)
  }
  return userMediaFunc;
}

const getUserMedia = getBrowserUserMedia();

class AudioRecorder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stream: null,
      recording: false,
      blob: null,
      waveData: { data: [], lineTo: 0 },
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.record !== this.props.record) {
      if (nextProps.record) {
        this.startRecording();
      } else {
        this.stopRecording();
      }
    }
  }

  startRecording() {
    console.log('starting record')

    const constraints = { audio: true, video: false }

    if (getUserMedia) {

      getUserMedia(constraints).then((stream) => {
        console.log('getUserMedia() success, stream created, initializing Recorder.js ...');
        this.audioContext = new AudioContext();
        console.log('audio context', this.audioContext);
        /*  assign to gumStream for later use  */
        this.gumStream = stream;
        /* use the stream */
        this.rec = new Recorder(this.audioContext, {
          numChannels: 1,
          onAnalysed: (waveData) => {
            if (this.props.record) {
              this.setState({ waveData });
            }
          },
        })
        
        // start the recording process
        this.rec.init(stream);
        this.setState({ recording: true }, () => {
          this.rec.start();
        });
      }).catch((err) => {
        alert('Something went wrong, Please make sure you\'re using the latest version of your browser');
        this.props.onStop();
      });
    } else {
      NotificationManager.info('Your browser doesn\'t support audio recording')
    }
  }

  stopRecording() {
    // tell the recorder to stop the recording
    this.rec.stop()
    .then(({ blob }) => {
      this.props.onStop(blob);
      this.setState({ waveData: null, recording: false });
    })

    // stop microphone access
    this.gumStream.getAudioTracks().forEach((track) => track.stop());
  }

  render() {
    return (
      <div>
        {this.state.waveData && (
          <WaveStream
            {...this.state.waveData}
            backgroundColor="#2185d0"
            strokeColor="#000000"
          />
        )}
      </div>
    )
  }
}

AudioRecorder.propTypes = {
  record: PropTypes.bool,
  onStop: PropTypes.func,
}

AudioRecorder.defaultProps = {
  record: false,
  onStop: () => {},
}

export default AudioRecorder;
