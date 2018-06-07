
'use strict';

// [START import]
const functions = require('firebase-functions'); // jshint ignore:line
const admin = require('firebase-admin');
admin.initializeApp();
var db = admin.database();
var refRunning = db.ref('/running-jobs');
var refFinished = db.ref('/finished-jobs');
// [END import]

// [START RunningJobsPubSub]
exports.RunningJobsPubSub = functions.pubsub.topic('bqtop-running-jobs').onPublish(message => {
        return refRunning.push(message.json);
});

// [END RunningJobsPubSub]


// [START FinishedJobsPubSub]
exports.FinishedJobsPubSub = functions.pubsub.topic('bqtop-finished-jobs').onPublish(message => {
        return refFinished.push(message.json);
});

// [END FinishedJobsPubSub]

// [START DeleteRunningJobWhenFinished]
exports.DeleteRunningJobWhenFinished = functions.database.ref('finished-jobs/{pushId}').onCreate((snapshot, context) => {
    const jobId = snapshot.val()['protoPayload']['serviceData']['jobCompletedEvent']['job']['jobName']['jobId'];
    return refRunning
        .orderByChild('protoPayload/serviceData/jobInsertResponse/resource/jobName/jobId')
        .equalTo(jobId)
        .once("value")
        .then(function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
                refRunning.child(childSnapshot.key).remove();
            });
        })
        .catch(function (err) {
            console.log(err);
        });
});

// [END DeleteRunningJobWhenFinished]

// [START DeleteRunningJobFromRunning]
// Sometimes jobs can be inserted to 'Finished' node before 'Running' node due to the log export and the fact that
// PubSub does not guarantee FIFO delivery. If that happens, delete the running job immediately.
exports.DeleteRunningJobFromRunning = functions.database.ref('running-jobs/{pushId}').onCreate((snapshot, context) => {
    const jobId = snapshot.val()['protoPayload']['serviceData']['jobInsertResponse']['resource']['jobName']['jobId'];
    return refFinished
        .orderByChild('protoPayload/serviceData/jobCompletedEvent/job/jobName/jobId')
        .equalTo(jobId)
        .once("value")
        .limitToFirst(1)
        .then(function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
                refRunning
                .orderByChild('protoPayload/serviceData/jobInsertResponse/resource/jobName/jobId')
                .equalTo(jobId)
                .once("value")
                .then(function (snapshot) {
                    snapshot.forEach(function (childSnapshot) {
                        refRunning.child(childSnapshot.key).remove();
                    });
                })
                .catch(function (err) {
                    console.log(err);
                });
            });
        })
        .catch(function (err) {
            console.log(err);
        });
});

// [END DeleteRunningJobFromRunning]
