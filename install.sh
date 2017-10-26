#!/bin/bash -
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
PROJECTID=`firebase list|grep -i $1 |awk '{print $4}'`
if [ -z "$PROJECTID" ]; then
 echo Project $1 Not Found!
# exit -1
fi
echo Project ID $PROJECTID
PROJECTID=aviv-playground2
#gcloud logging sinks create bqtop-finished-jobs pubsub.googleapis.com/projects/$PROJECTID/topics/bqtop-finished-jobs --log-filter="resource.type="bigquery_resource" "protoPayload.methodName="jobservice.jobcompleted" # > /dev/null 2>&1
#ServiceAccountF=`gcloud logging sinks describe bqtop-finished-jobs|grep writerIdentity|awk '{print $2}'`
#gcloud projects add-iam-policy-binding $PROJECTID --member=$ServiceAccountF --role='roles/pubsub.publisher''
#gcloud  logging sinks create bqtop-running-jobs pubsub.googleapis.com/projects/$PROJECTID/topics/bqtop-running-jobs --log-filter="resource.type="bigquery_resource" "protoPayload.methodName="jobservice.insert" #> /dev/null 2>&1
#ServiceAccountR=`gcloud logging sinks describe bqtop-running-jobs|grep writerIdentity|awk '{print $2}'`
#gcloud projects add-iam-policy-binding $PROJECTID --member=$ServiceAccountR --role='roles/pubsub.publisher'

SERVICE_NAMES=("bqtop-finished-jobs" "bqtop-running-jobs")
FILTERS=("\"\"resource.type=\"bigquery_resource\" \"protoPayload.methodName=\"jobservice.jobcompleted\"\"" "\"\"resource.type=\"bigquery_resource\" \"protoPayload.methodName=\"jobservice.insert\""\")
COUNTER=0
echo -n "* Creating Pub/Sub topics..."

for s in ${SERVICE_NAMES[@]}; do
 gcloud beta pubsub topics create  ${s} --project=$PROJECTID --quiet >/dev/null || error_exit "Error creating Pub/Sub topics"
done

echo "done"

echo -n "* Creating Pub/Sub subscriptions..."
#for s in ${SERVICE_NAMES[@]}; do
#gcloud alpha pubsub subscriptions create ${s} --topic ${s}  --project=$PROJECTID --quiet >/dev/null || error_exit "Error creating Pub/Sub subscriptions"
#done

echo "done"

echo -n "* Creating Log Export sinks..."
#for s in ${SERVICE_NAMES[@]}; do
#gcloud logging sinks create ${s} --project=$PROJECTID pubsub.googleapis.com/projects/$PROJECTID/topics/${s} --log-filter=${FILTERS[COUNTER]} # --quiet >/dev/null || error_exit "Error creating Log Export sinks"
#COUNTER=$((COUNTER+1))
#done
echo "done"
gcloud logging sinks create bqtop-finished-jobs pubsub.googleapis.com/projects/$PROJECTID/topics/bqtop-finished-jobs --log-filter="resource.type="bigquery_resource" "protoPayload.methodName="jobservice.jobcompleted"  > /dev/null 2>&1
ServiceAccountF=`gcloud logging sinks describe bqtop-finished-jobs|grep writerIdentity|awk '{print $2}'`
gcloud projects add-iam-policy-binding $PROJECTID --member=$ServiceAccountF --role='roles/pubsub.publisher'
gcloud  logging sinks create bqtop-running-jobs pubsub.googleapis.com/projects/$PROJECTID/topics/bqtop-running-jobs  --log-filter="resource.type="bigquery_resource" "protoPayload.methodName="jobservice.insert" > /dev/null 2>&1
ServiceAccountR=`gcloud logging sinks describe bqtop-running-jobs|grep writerIdentity|awk '{print $2}'`
gcloud projects add-iam-policy-binding $PROJECTID --member=$ServiceAccountR --role='roles/pubsub.publisher'
#cd firebase
#firebase use --add  $PROJECTID
#firebase deploy