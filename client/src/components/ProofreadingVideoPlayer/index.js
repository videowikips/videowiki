import React from 'react';
import { formatTime } from '../../utils/helpers';
import { Button } from 'semantic-ui-react';

export default class ProofreadingVideoPlayer extends React.Component {
    state = {
        controlsVisible: false,
    }

    onProgressClick = (e) => {
        const percent = (e.clientX - e.target.getBoundingClientRect().x) / e.target.getBoundingClientRect().width;
        const { duration } = this.props;
        this.props.onTimeChange(duration * percent)

    }

    render() {
        return (
            <div
                style={{ width: '700px', margin: '0 auto', position: 'relative' }}
                onMouseOver={() => this.setState({ controlsVisible: true })}
                onMouseLeave={() => this.setState({ controlsVisible: false })}
            >
                <video
                    width={'100%'}
                    style={{ maxWidth: '100%', margin: '0 auto', display: 'block' }}
                    src={this.props.url}
                    ref={(ref) => this.props.videoRef(ref)}
                    onLoadedData={this.props.onVideoLoad}
                />
                {this.props.text && (
                    <p
                        style={{
                            position: 'absolute',
                            left: '0',
                            right: 0,
                            bottom: this.state.controlsVisible ? '13%' : '8%',
                            color: 'white',
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            padding: 5,
                            textAlign: 'center'
                        }}
                    >
                        {this.props.text}
                    </p>
                )}

                    <span
                        style={{
                            position: 'absolute',
                            left: '41%',
                            bottom: this.state.controlsVisible ? '8%' : '3%',
                            color: 'white',
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            padding: 5
                        }}
                    >
                        Time: {formatTime(this.props.currentTime)}/{formatTime(this.props.duration)}
                    </span>

                {this.state.controlsVisible && (
                    <div className="controls"
                        style={{
                            position: 'absolute',
                            bottom: '-7%',
                            left: 0,
                            alignItems: 'center',
                            width: 700,
                            margin: '2rem auto'
                        }}>
                        <Button
                            style={{
                                width: '5%',
                                verticalAlign: 'middle',
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                marginLeft: 5,
                                marginBottom: 5,
                                color: 'white',
                                borderRadius: '50%',
                            }}
                            onClick={this.props.onPlayToggle}
                            icon={this.props.playing ? 'pause' : 'play'}
                        />
                        <div style={{ display: 'inline-block', width: '93%', marginTop: 5, verticalAlign: 'middle' }}>
                            <progress
                                min='0'
                                max='100'
                                value={this.props.currentTime / this.props.duration * 100}
                                style={{ width: '100%' }}
                                onClick={this.onProgressClick}
                            ></progress>
                        </div>
                    </div>
                )}
            </div>
        )
    }
}



