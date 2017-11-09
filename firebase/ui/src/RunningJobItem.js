import React, { Component } from 'react';

import './RunningJobItem.css';

class RunningJobItem extends Component {
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
    const { job } = this.props;

    const timer = this.state.secondsElapsed > 59 ? `${Math.floor(this.state.secondsElapsed / 60)}m ${this.state.secondsElapsed % 60}s` : `${this.state.secondsElapsed}s`;

    return (
      <div className="container">
        <div>

          <h4> Job ID <a target="_blank" href={`https://developers.google.com/apis-explorer/#p/bigquery/v2/bigquery.jobs.cancel?projectId=${process.env.REACT_APP_FIREBASE_PROJECT_ID}&jobId=${encodeURIComponent(job.protoPayload.serviceData.jobInsertResponse.resource.jobName.jobId)}`} >
            (abort)
          </a>
          </h4>
          <p><a target="_blank" href={`https://developers.google.com/apis-explorer/#p/bigquery/v2/bigquery.jobs.get?projectId=${process.env.REACT_APP_FIREBASE_PROJECT_ID}&jobId=${encodeURIComponent(job.protoPayload.serviceData.jobInsertResponse.resource.jobName.jobId)}`} >{job.protoPayload.serviceData.jobInsertResponse.resource.jobName.jobId}</a></p>
          <h4> Run By </h4>
          <p>
            {job.protoPayload.authenticationInfo.principalEmail}
          </p>
          <h4> Query Duration </h4>
          <p>{timer}</p>
        </div>
      </div>

    );
  }
}

export default RunningJobItem;

