/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

// [START import]
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
var db = admin.database();
var refRunning = db.ref('/running-jobs');
var refFinished = db.ref('/finished-jobs');
// [END import]

// [START RunningJobsPubSub]
/**
 * Cloud Function to be triggered by Pub/Sub that logs a message using the data published to the
 * topic.
 */
// [START trigger]
exports.RunningJobsPubSub = functions.pubsub.topic('bqps-running-jobs').onPublish(event => {
// [END trigger]
    const pubSubMessage = event.data;
return refRunning.push(pubSubMessage.json);
})
;
// [END RunningJobsPubSub]


// [START RunningJobsPubSub]
/**
 * Cloud Function to be triggered by Pub/Sub that logs a message using the data published to the
 * topic.
 */
// [START trigger]
exports.FinishedJobsPubSub = functions.pubsub.topic('bqps-finished-jobs').onPublish(event => {
// [END trigger]
   const pubSubMessage = event.data;
   return refFinished.push(pubSubMessage.json);
})
;


// [END finishedJobsPubSub]
exports.DeleteRunningJobFromFinished = functions.database.ref('finished-jobs/{key}').onCreate(event => {
      const runningRef = event.data.adminRef.root.child('running-jobs')
      const jobId = event.data.val()['protoPayload']['serviceData']['jobCompletedEvent']['job']['jobName']['jobId']
      runningRef.orderByChild('protoPayload/serviceData/jobInsertResponse/resource/jobName/jobId')
          .equalTo(jobId).once("value", function (snapshot) {
              snapshot.forEach(function (data) {
          runningRef.child(data.key).remove()

    })

});

});

exports.DeleteRunningJobFromRunning = functions.database.ref('running-jobs/{key}').onCreate(event => {
    const runningRef = event.data.adminRef.root.child('running-jobs')
    const finishedRef = event.data.adminRef.root.child('finished-jobs')
    const jobId = event.data.val()['protoPayload']['serviceData']['jobInsertResponse']['resource']['jobName']['jobId']
    finishedRef.orderByChild('protoPayload/serviceData/jobCompletedEvent/job/jobName/jobId').equalTo(jobId).once("value", function (snapshot) {
    snapshot.forEach(function (data) {
        runningRef.orderByChild('protoPayload/serviceData/jobInsertResponse/resource/jobName/jobId').
        equalTo(jobId)
            .once("value", function (snapshot) {
            snapshot.forEach(function (data) {
            runningRef.child(data.key).remove()

            })

        });


    })

});

});
