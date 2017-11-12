import React, { Component } from 'react';

import Timer from './Timer';

import './RunningJobItem.css';

class RunningJobItem extends Component {
  render() {
    const { job, secondsElapsed } = this.props;

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
          <Timer secondsElapsed={secondsElapsed} />
        </div>
      </div>
    );
  }
}

export default RunningJobItem;

