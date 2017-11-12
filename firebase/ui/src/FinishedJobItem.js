import React, { Component } from 'react';

import './FinishedJobItem.css';

class GridItem extends Component {
  render() {
    const { job, error } = this.props;
    let details;

    if (error) {
      details = "Query Failed";
    } else {
      let gigabyte, tier, cost;
      const bytes = job.protoPayload.serviceData.jobCompletedEvent.job.jobStatistics.totalBilledBytes;
      if (bytes) {
        gigabyte = parseInt(job.protoPayload.serviceData.jobCompletedEvent.job.jobStatistics.totalBilledBytes, 10) / (1024 * 1024 * 1024);
        tier = parseInt(job.protoPayload.serviceData.jobCompletedEvent.job.jobStatistics.billingTier, 10);
        cost = gigabyte * 0.005 * tier;
      } else {
        gigabyte = 0;
        tier = 1;
        cost = 0.0;
      }
      details = `${gigabyte.toFixed(1)} GB / Tier ${tier} / $${(cost).toFixed(2)}`;
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

