import React, { Component } from 'react';

class Timer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      secondsElapsed: props.secondsElapsed,
      interval: setInterval(this.tick, 1000),
    };

  }

  tick = () => {
    this.setState({ secondsElapsed: this.state.secondsElapsed + 1 });
  }

  componentDidMount() {

  }

  componentWillUnmount() {
    clearInterval(this.state.interval);
  }

  render() {
    const timer = this.state.secondsElapsed > 59 ? `${Math.floor(this.state.secondsElapsed / 60)}m ${this.state.secondsElapsed % 60}s` : `${this.state.secondsElapsed}s`;

    return (
      <p>{timer}</p>
    );
  }
}

export default Timer;

