#!/bin/bash
set -x
chown -R ubuntu:ubuntu /home/ubuntu/hotspot-backend/

echo  "***Installing npm package ***" >> /tmp/hotspot-backend-api-prod_deploy_logs
echo >> /tmp/hotspot-backend-api-prod_deploys_logs
runuser -l ubuntu -c 'cd /home/ubuntu/hotspot-backend && npm install'
runuser -l ubuntu -c 'cd /home/ubuntu/hotspot-backend && npm install --unsafe-perm'
sleep 10
echo "***starting hotspot0-backend-admin-api-prod application ***" >> /tmp/hotspot-backend-api-prod_deploy_logs
runuser -l ubuntu -c 'cd /home/ubuntu/hotspot-backend && sudo pm2 start index.js --name hotspot0  --silent' >> /tmp/hotspot-backend-api-prod_deploy_logs

s1=`pm2 status | grep -we hotspot0 | awk '{print $12}'`
sleep 5
s2=`pm2 status | grep -we hotspot0 | awk '{print $12}'`
if [ $s1 == $s2 ]
then
echo "BUILD SUCCESSFUL" >> /tmp/hotspot-backend-api-prod_deploy_logs
echo >> /tmp/hotspot-backend-api-prod_deploy_logs
else
echo "Node process is restarting" >> /tmp/hotspot-backend-api-prod_deploy_logs
echo >> /tmp/hotspot-backend-api-prod_deploy_logs
fi