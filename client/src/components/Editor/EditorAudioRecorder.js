import React, { PropTypes } from 'react';
import { Grid, Popup, Icon, Button, Input } from 'semantic-ui-react';
import AudioRecorder from '../common/AudioRecorder';
import AuthModal from '../common/AuthModal';

class EditorAudioRecorder extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoginModalVisible: false,
    }
  }

  toggleRecording() {
    if (this.props.isLoggedIn) {
      this.props.toggleRecording();
    } else {
      this.setState({ isLoginModalVisible: true });
    }
  }

  onStop(recordedBlob) {
    this.props.onStop(recordedBlob);
  }

  _renderLoginModal() {
    return (
      <AuthModal open={this.state.isLoginModalVisible} heading={'Only logged in users can record audio'} onClose={() => this.setState({ isLoginModalVisible: false })} />
    )
  }

  onDeleteAudio(slidePosition) {
    if (this.props.isLoggedIn) {
      this.props.onDeleteAudio(slidePosition)
    } else {
      this.setState({ isLoginModalVisible: true });
    }
  }

  render() {
    return (
      <div style={{ padding: '2rem', paddingTop: '1rem', fontWeight: 'bold', fontSize: '1.2rem', border: '1px solid #444', borderTop: 0, background: '#eee' }}>
        <Grid verticalAlign="middle" centered>
          <Grid.Row style={{ display: 'flex', alignItems: 'center' }}>
            <Grid.Column computer={4} mobile={4}>
              Audio
              {/* <Popup trigger={<Icon name="info circle" className="pl1" />} content={
                <div>
                  <div>
                    Control the Timing of the slide's media by adjusting the drag bar on the right
                    to match the required position in the bottom audio player
                  </div>
                </div>
              }
              /> */}
            </Grid.Column>

            <Grid.Column computer={12} mobile={16}>
              <Grid.Row>
                <Grid style={{ display: 'flex', alignItems: 'center' }}>

                  <Grid.Column width={16}>
                    <div style={{ display: 'flex', alignItems: 'center', minHeight: 120 }}>
                      <p style={{ padding: 0, margin: 0 }}>
                        <Button
                          icon
                          primary
                          // size="large"
                          iconPosition="left"
                          loading={this.props.loading}
                          disabled={this.props.disabled}
                          onClick={this.toggleRecording.bind(this)}
                        >
                          {!this.props.recording ? (
                            <Icon name="microphone" />
                          ) : (
                              <Icon name="stop" />
                            )}
                          {!this.props.recording ? ' Record' : ' Stop'}
                        </Button>

                      </p>
                      {!this.props.recording && !this.props.loading && (
                        <span>
                          <Button
                            // icon
                            // primary
                            // size="large"
                            basic
                            iconPosition="left"
                            loading={this.props.loading}
                            disabled={this.props.disabled}
                            onClick={() => this.uploadref.click()}
                          >
                            {!this.props.recording ? (
                              <Icon name="microphone" />
                            ) : (
                                <Icon name="stop" />
                              )}
                            Upload File
                          </Button>
                          <input
                            onChange={(e) => {
                              this.onStop(e.target.files[0])
                            }}
                            type="file"
                            accept=".webm, .mp3, .wav, .m4a"
                            style={{ display: 'none' }}
                            ref={(ref) => this.uploadref = ref}
                          />
                        </span>
                      )}
                      <div className="c-export-human-voice__recorder-mic-container" style={{ 'display': this.props.recording ? 'block' : 'none' }} >
                        <AudioRecorder
                          record={this.props.recording}
                          className="c-export-human-voice__recorder-mic"
                          onStop={this.onStop.bind(this)}
                          backgroundColor="#2185d0"
                          strokeColor="#000000"
                        />
                      </div>
                      {this.props.currentSlide && this.props.currentSlide.audio && !this.props.recording && !this.props.loading && (
                        <div style={{ marginLeft: 20, display: 'flex', alignItems: 'center' }}>
                          <audio src={this.props.currentSlide.audio} controls />
                          <Icon name="close" className="c-export-human-voice__clear-record" onClick={() => this.onDeleteAudio(this.props.currentSlide.position)} />
                        </div>
                      )}

                    </div>

                  </Grid.Column>
                </Grid>
                {this._renderLoginModal()}
              </Grid.Row>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    )
  }
}

EditorAudioRecorder.defaultProps = {
  recording: false,
  isLoggedIn: false,
  loading: false,
  disabled: false,
  onStop: () => { },
  toggleRecording: () => { },
  onDeleteAudio: () => { },
  currentSlide: {},
}

EditorAudioRecorder.propTypes = {
  onStop: PropTypes.func,
  toggleRecording: PropTypes.func,
  onDeleteAudio: PropTypes.func,
  recording: PropTypes.bool,
  disabled: PropTypes.bool,
  isLoggedIn: PropTypes.bool,
  loading: PropTypes.bool,
  currentSlide: PropTypes.object,
}

export default EditorAudioRecorder;
