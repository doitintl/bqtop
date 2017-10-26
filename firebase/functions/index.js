
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
exports.RunningJobsPubSub = functions.pubsub.topic('bqtop-running-jobs').onPublish(event => {
// [END trigger]
    const pubSubMessage = event.data;
return refRunning.push(pubSubMessage.json);
})
// [END RunningJobsPubSub]


// [START FinishedJobsPubSub]
exports.FinishedJobsPubSub = functions.pubsub.topic('bqtop-finished-jobs').onPublish(event => {

    const pubSubMessage = event.data;
return refFinished.push(pubSubMessage.json);
})

// [END FinishedJobsPubSub]

// [START DeleteRunningJobFromFinished]
exports.DeleteRunningJobFromFinished = functions.database.ref('finished-jobs/{key}').onCreate(event =>
    {
        const runningRef = event.data.adminRef.root.child('running-jobs')
        const jobId = event.data.val()['protoPayload']['serviceData']['jobCompletedEvent']['job']['jobName']['jobId']
        runningRef.orderByChild('protoPayload/serviceData/jobInsertResponse/resource/jobName/jobId')
        .equalTo(jobId).once("value", function (snapshot) {
        snapshot.forEach(function (data) {
            runningRef.child(data.key).remove()

    })

});

})
// [END DeleteRunningJobFromFinished]


// [START DeleteRunningJobFromRunning]
exports.DeleteRunningJobFromRunning = functions.database.ref('running-jobs/{key}').onCreate(event => {
    const runningRef = event.data.adminRef.root.child('running-jobs');
    const finishedRef = event.data.adminRef.root.child('finished-jobs');
    const jobId = event.data.val()['protoPayload']['serviceData']['jobInsertResponse']['resource']['jobName']['jobId']
    finishedRef.orderByChild('protoPayload/serviceData/jobCompletedEvent/job/jobName/jobId').
    equalTo(jobId).once("value", function (snapshot) {
        snapshot.forEach(function (data) {
            runningRef.orderByChild('protoPayload/serviceData/jobInsertResponse/resource/jobName/jobId').equalTo(jobId)
                .once("value", function (snapshot) {
                    snapshot.forEach(function (data) {
                        runningRef.child(data.key).remove()

                    })

                });


        })

});

})
// [END DeleteRunningJobFromRunning]