#!/bin/bash
set -x
echo "** hotspot-backend-api-prod process status **" >> /tmp/hotspot-backend-api-prod_deploy_logs
runuser -l ubuntu -c 'sudo pm2 status' | grep -wo hotspot0
if [  $? -ne 0 ];
then
    echo "############################## pm2 not running #################################" >> /tmp/hotspot-backend-api-prod_deploy_logs
else
    echo "############################## pm2 already running Deleting ####################" >> /tmp/hotspot-backend-api-prod_deploy_logs
     runuser -l ubuntu -c 'sudo pm2 delete hotspot0'
fi

rm -rf /home/ubuntu/hotspot-backend

if [ ! -d /home/ubuntu/hotspot-backend ]; then
runuser -l ubuntu -c 'mkdir -p /home/ubuntu/hotspot-backend' >> /tmp/hotspot-backend-prod_deploy_logs
fi