#!/usr/bin/env bash
#===============================================================================
#
#          FILE: install.sh
#
#         USAGE: ./install.sh
#
#   DESCRIPTION: Install all the needed server bits for BQTop
#
#       OPTIONS: --- project name
#  REQUIREMENTS: ---
#          BUGS: ---
#         NOTES: ---
#        AUTHOR: Aviv Laufer (), aviv@doit-int.com
#  ORGANIZATION: DoiT International
#       CREATED: 25/10/2017 11:59:03
#===============================================================================

set -o nounset                                  # Treat unset variables as an error
function error_exit
{
    echo "$1" 1>&2
    exit 1
}
if [ $# -eq 0 ]
  then
    error_exit "No arguments supplied"
fi
PROJECTID=`firebase list | grep -i $1 | awk 'BEGIN { FS="│" } { printf $3 }' | sed 's/ //g'`
if [ -z "$PROJECTID" ]; then
 echo Project $1 Not Found!
 exit 
fi
echo Project ID $PROJECTID
gcloud config set project $PROJECTID
echo -n "* Installing NPM Packages..."
npm install -g firebase-tools
cd firebase/functions/
npm install
cd ../..
echo -n "* Creating Pub/Sub topics..."

gcloud beta pubsub topics create bqtop-running-jobs --project=$PROJECTID --quiet >/dev/null || error_exit "Error creating Pub/Sub topics"
gcloud beta pubsub topics create bqtop-finished-jobs --project=$PROJECTID --quiet >/dev/null || error_exit "Error creating Pub/Sub topics"

echo "done"

echo -n "* Creating Log Export sinks..."

gcloud logging sinks create bqtop-running-jobs-export pubsub.googleapis.com/projects/$PROJECTID/topics/bqtop-running-jobs --project=$PROJECTID --log-filter 'resource.type="bigquery_resource" protoPayload.methodName="jobservice.insert" protoPayload.serviceData.jobInsertRequest.resource.jobConfiguration.query:*' --quiet >/dev/null || error_exit "Error creating Log Export sink"

ServiceAccountR=`gcloud logging sinks describe bqtop-running-jobs-export|grep writerIdentity|awk '{print $2}'`
gcloud projects add-iam-policy-binding $PROJECTID --member=$ServiceAccountR --role='roles/pubsub.publisher'  --quiet >/dev/null || error_exit "Error creating Log Export sink"

gcloud logging sinks create bqtop-finished-jobs-export pubsub.googleapis.com/projects/$PROJECTID/topics/bqtop-finished-jobs --project=$PROJECTID --log-filter 'resource.type="bigquery_resource" protoPayload.methodName="jobservice.jobcompleted" protoPayload.serviceData.jobCompletedEvent.job.jobConfiguration.query:*' --quiet >/dev/null || error_exit "Error creating Pub/Sub topics"

ServiceAccountF=`gcloud logging sinks describe bqtop-finished-jobs-export|grep writerIdentity|awk '{print $2}'`
gcloud projects add-iam-policy-binding $PROJECTID --member=$ServiceAccountF --role='roles/pubsub.publisher'  --quiet >/dev/null || error_exit "Error creating Pub/Sub topics"

echo "done"

cd firebase/ui
if [ ! -f .env.production ]; then
    echo "File .env.production not found in firebase/ui !"
    exit
fi
yarn install
yarn run build

cd ..
firebase use --add $PROJECTID
firebase deploy
cd ..
