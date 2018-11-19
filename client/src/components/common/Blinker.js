import React, { PropTypes } from 'react';

export default class Blinker extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      count: 0,
      interval: null,
      color: this.props.primary,
    }
  }

  componentDidMount() {
    if (this.props.blink) {
      this.startBlinking();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.blink && !nextProps.blink && this.state.interval) {
      this.stopBlinking();
    } else if (!this.props.blink && nextProps.blink && !this.state.interval) {
      this.blink();
      this.startBlinking()
    }
  }

  componentWillUnmount() {
    if (this.state.interval) {
      clearInterval(this.state.interval);
    }
  }

  startBlinking() {
    if (!this.state.interval) {
      const interval = setInterval(() => {
        this.blink();
      }, this.props.interval);

      this.props.onStart();
      this.setState({ interval });
    }
  }

  stopBlinking() {
    if (this.state.interval) {
      clearInterval(this.state.interval);
      this.props.onStop();
      this.setState({ count: 0, interval: null })
    }
  }

  blink() {
    if (this.props.repeat === -1 || this.state.count < this.props.repeat) {
      this.setState({ color: this.props.secondary });
      setTimeout(() => {
        this.setState((state) => ({
          color: this.props.primary,
          count: state.count + 1,
        }));
      }, this.props.interval / 2);
    } else if (this.props.repeat !== -1 && this.state.count >= this.props.repeat) {
      this.stopBlinking();
    }
  }

  render() {
    return (
      <span style={{ backgroundColor: this.state.color }} >
        {this.props.children}
      </span>
    )
  }
}

Blinker.defaultProps = {
  blink: false,
  onStop: () => { },
  onStart: () => { },
  primary: 'transparent',
  secondary: 'blue',
  interval: 2000,
  repeat: -1,
}

Blinker.propTypes = {
  blink: PropTypes.bool.isRequired,
  onStop: PropTypes.func,
  onStart: PropTypes.func,
  primary: PropTypes.string,
  secondary: PropTypes.string,
  interval: PropTypes.number,
  children: PropTypes.any,
  repeat: PropTypes.number,
}
