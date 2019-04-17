import React, { PropTypes } from 'react';

import Recorder from 'recorder-js';
// shim for AudioContext when it's not avb.
const AudioContext = window.AudioContext || window.webkitAudioContext;

navigator.getUserMedia = (navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia);

class AudioRecorder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stream: null,
      analyserData: null,
      recording: false,
      blob: null,
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

    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      console.log('getUserMedia() success, stream created, initializing Recorder.js ...');
      this.audioContext = new AudioContext();
      console.log('audio context', this.audioContext);
      /*  assign to gumStream for later use  */
      this.gumStream = stream;
      /* use the stream */
      this.rec = new Recorder(this.audioContext, { numChannels: 2 })

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
    })

    // stop microphone access
    this.gumStream.getAudioTracks().forEach((track) => track.stop());
  }

  render() {
    return (
      <span>
      </span>
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
