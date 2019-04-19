import React, { PropTypes } from 'react';
import WaveStream from 'react-wave-stream';
import Recorder from 'recorder-js';
// shim for AudioContext when it's not avb.
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

    getBrowserUserMedia()(constraints).then((stream) => {
      console.log('getUserMedia() success, stream created, initializing Recorder.js ...');
      this.audioContext = new AudioContext();
      console.log('audio context', this.audioContext);
      /*  assign to gumStream for later use  */
      this.gumStream = stream;
      /* use the stream */
      this.rec = new Recorder(this.audioContext, {
        numChannels: 2,
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
      console.log('Recording started');
    }).catch((err) => {
      alert('Something went wrong, Please make sure you\re using the latest version of your browser');
      console.log(err);
    });
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
