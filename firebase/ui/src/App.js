import React, { Component } from 'react';
import sortBy from 'lodash/sortBy';
import { easings } from 'react-stonecutter';

import firebase, { googleProvider } from './firebase'
import Grid from './Grid';
import RunningJobItem from './RunningJobItem';
import FinishedJobItem from './FinishedJobItem';

import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user: null,
      isAuthInit: false,
      runningJobs: [],
      finishedJobs: [],

      useCSS: true,
      responsive: true,
      layout: 'pinterest',
      enterExitStyle: 'simple',
      duration: 650,
      stiffness: 60,
      damping: 15,
      columns: 5,
      gutters: 0,
      easing: easings.cubicOut
    };

    this.maxFinishedJobs = 24;

  }

  handleSignOut = () => {
    firebase.database().ref('running-jobs').off();
    firebase.database().ref('finished-jobs').off();
    firebase.auth().signOut().then(() => {
      this.setState({
        user: null,
        isAuthInit: false,
        runningJobs: [],
        finishedJobs: [],
      });
    });
  }

  handleSignIn = () => {
    firebase.auth().signInWithRedirect(googleProvider);
  }

  sortJobsByCreateTime = (jobs) => {
    return sortBy(jobs, (job) => {
      return new Date(job.protoPayload.serviceData.jobInsertResponse.resource.jobStatistics.createTime)
    }).reverse();
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      this.setState({ user, isAuthInit: true });
      if (user) {
        firebase.database().ref('running-jobs').on('child_added', (snapshot) => {
          const newJob = snapshot.val();
          newJob.key = snapshot.key;
          let runningJobs = this.state.runningJobs.slice();
          runningJobs.push(newJob);
          runningJobs = this.sortJobsByCreateTime(runningJobs);
          this.setState({ runningJobs });
        }, (error) => {
          console.error(error);
        });

        firebase.database().ref('running-jobs').on('child_removed', (snapshot) => {
          const removedJob = snapshot.val();
          let runningJobs = this.state.runningJobs.slice().filter(function (job) {
            return job.insertId !== removedJob.insertId;
          });
          runningJobs = this.sortJobsByCreateTime(runningJobs);
          this.setState({ runningJobs });
        }, (error) => {
          console.error(error);
        });

        firebase.database().ref('finished-jobs').on('child_removed', (snapshot) => {
          const removedJob = snapshot.val();
          let finishedJobs = this.state.finishedJobs.slice().filter(function (job) {
            return job.insertId !== removedJob.insertId;
          });
          this.setState({ finishedJobs });
        }, (error) => {
          console.error(error);
        });

        firebase.database().ref('finished-jobs').orderByChild('receiveTimestamp').limitToLast(this.maxFinishedJobs).on('child_added', (snapshot) => {
          const finishedJob = snapshot.val();
          let finishedJobs = this.state.finishedJobs.slice(0, this.maxFinishedJobs - 1);
          finishedJobs.unshift(finishedJob);
          this.setState({ finishedJobs });
        }, (error) => {
          console.error(error);
        });
      }
    });
  }

  handleClear = key => () => {
    firebase.database().ref('running-jobs').child(key).remove();
  }

  componentWillUnmount() {
    firebase.database().ref('running-jobs').off();
    firebase.database().ref('finished-jobs').off();
  }

  render() {
    const { user, isAuthInit, runningJobs, finishedJobs, ...gridProps } = this.state;
    const { layout } = this.state;

    const now = new Date();
    const itemHeight = layout === 'simple' ? 200 : null;

    const runningJobItems =
      runningJobs.map((job) => {
        const createTime = new Date(job.protoPayload.serviceData.jobInsertResponse.resource.jobStatistics.createTime);
        const secondsElapsed = Math.round((now.getTime() - createTime.getTime()) / 1000);

        return (
          <li
            key={job.insertId}
            className="grid-item"
            style={{
              width: 200,
              height: itemHeight,
              backgroundColor: '#C8E6C9'
            }}>
            <RunningJobItem job={job} onClear={this.handleClear(job.key)} secondsElapsed={secondsElapsed} />
          </li>
        );
      });

    const finishedJobItems =
      finishedJobs.map((job) => {
        const error = 'error' in job.protoPayload.serviceData.jobCompletedEvent.job.jobStatus;
        const backgroundColor = error ? '#EF9A9A' : '#B3E5FC';
        return (
          <li
            key={job.insertId}
            className="grid-item"
            style={{
              width: 200,
              height: itemHeight,
              backgroundColor: backgroundColor
            }}>
            <FinishedJobItem job={job} error={error} />
          </li>
        );
      });

    return (
      <div>
        <div className="header">
          {
            user ?
              (
                <div>
                  <button onClick={this.handleSignOut}>Logout</button>
                  <span>Hi, {user.displayName}</span>
                </div>
              ) : (
                isAuthInit && <button onClick={this.handleSignIn}>Login with Google</button>
              )
          }
          <div></div>
          <span><a href="http://www.doit-intl.com">DoIT International</a></span>
        </div>

        {
          user && runningJobItems.length > 0 &&
          <div>
            <section>
              <h4>{runningJobItems.length} Running Queries </h4>
              <Grid
                itemHeight={itemHeight}
                measured={layout !== 'simple'}
                {...gridProps}
              >
                {runningJobItems}
              </Grid>
            </section>
          </div>
        }

        {
          user && finishedJobItems.length > 0 &&
          <div>
            <section>
              <h4>Last {this.maxFinishedJobs} Finished Queries</h4>
              <Grid
                itemHeight={itemHeight}
                measured={layout !== 'simple'}
                {...gridProps}
              >
                {finishedJobItems}
              </Grid>
            </section>
          </div>
        }
      </div>
    );
  }
}

export default App;
