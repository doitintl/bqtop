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
#  ORGANIZATION: DoIt International
#       CREATED: 25/10/2017 11:59:03
#===============================================================================

set -o nounset                                  # Treat unset variables as an error
function error_exit
{
    echo "$1" 1>&2
    exit 1
}
PROJECTID=`firebase list|grep -i $1 |awk 'BEGIN { FS="│" }  { print $3 }'`
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

gcloud beta pubsub topics create  bqtop-running-jobs --project=$PROJECTID --quiet >/dev/null || error_exit "Error creating Pub/Sub topics"
gcloud beta pubsub topics create  bqtop-finished-jobs --project=$PROJECTID --quiet >/dev/null || error_exit "Error creating Pub/Sub topics"

echo "done"

echo -n "* Creating Log Export sinks..."
gcloud  logging sinks create bqtop-running-jobs-export pubsub.googleapis.com/projects/$PROJECTID/topics/bqtop-running-jobs  --log-filter="resource.type="bigquery_resource" "protoPayload.methodName="jobservice.insert" --quiet >/dev/null || error_exit "Error creating Pub/Sub topics"
ServiceAccountR=`gcloud logging sinks describe bqtop-running-jobs-export|grep writerIdentity|awk '{print $2}'`
gcloud projects add-iam-policy-binding $PROJECTID --member=$ServiceAccountR --role='roles/pubsub.publisher'  --quiet >/dev/null || error_exit "Error creating Pub/Sub topics"

gcloud logging sinks create bqtop-finished-jobs-export pubsub.googleapis.com/projects/$PROJECTID/topics/bqtop-finished-jobs --log-filter="resource.type="bigquery_resource" "protoPayload.methodName="jobservice.jobcompleted"  --quiet >/dev/null || error_exit "Error creating Pub/Sub topics"
ServiceAccountF=`gcloud logging sinks describe bqtop-finished-jobs-export|grep writerIdentity|awk '{print $2}'`
gcloud projects add-iam-policy-binding $PROJECTID --member=$ServiceAccountF --role='roles/pubsub.publisher'  --quiet >/dev/null || error_exit "Error creating Pub/Sub topics"
echo "done"
cd firebase
firebase use --add  $PROJECTID
firebase deploy
cd ..
