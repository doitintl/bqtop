import React, { Component } from 'react';

import './FinishedJobItem.css';

class GridItem extends Component {
  constructor(props) {
    super(props);

    this.state = {

    };

  }

  componentDidMount() {

  }

  componentWillUnmount() {

  }

  render() {
    const { job } = this.props;
    const isError = 'error' in job.protoPayload.serviceData.jobCompletedEvent.job.jobStatus;
    let details;
    if (isError) {
      details = "Query Failed";
    } else {
      let gigabyte, tier;
      const bytes = job.protoPayload.serviceData.jobCompletedEvent.job.jobStatistics.totalBilledBytes;
      if (bytes) {
        gigabyte = parseInt(job.protoPayload.serviceData.jobCompletedEvent.job.jobStatistics.totalBilledBytes, 10) / (1024 * 1024 * 1024);
        tier = parseInt(job.protoPayload.serviceData.jobCompletedEvent.job.jobStatistics.billingTier, 10);
      } else {
        gigabyte = parseInt(0, 10);
        tier = parseInt(1, 10);
      }
      details = `${gigabyte.toFixed(1)} GB / Tier ${tier} / ${(gigabyte * 0.05 * tier).toFixed(1)}`;
    }
    
    return (
      <div className="container" >
        <div>
          <h4> Job ID </h4>
          <p>
            <a target="_blank" href={`https://developers.google.com/apis-explorer/#p/bigquery/v2/bigquery.jobs.get?projectId=${process.env.REACT_APP_FIREBASE_PROJECT_ID}&jobId=${encodeURIComponent(job.protoPayload.serviceData.jobCompletedEvent.job.jobName.jobId)}`} > {job.protoPayload.serviceData.jobCompletedEvent.job.jobName.jobId}</a>
          </p>
          <h4> Cost </h4>
          <p>
            {details}
          </p>
        </div>
      </div>

    );
  }
}

export default GridItem;

