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


    return (
      <div className="container">
        <div>
          <h4> Job ID </h4>
          <p>
            <a target="_blank" href={`https://developers.google.com/apis-explorer/#p/bigquery/v2/bigquery.jobs.get?projectId=${process.env.REACT_APP_FIREBASE_PROJECT_ID}&jobId=${encodeURIComponent(job.protoPayload.serviceData.jobCompletedEvent.job.jobName.jobId)}`} > {job.protoPayload.serviceData.jobCompletedEvent.job.jobName.jobId}</a>
          </p>
        </div>
      </div>

    );
  }
}

export default GridItem;

