#!/bin/bash

#install cloud watch agent
sudo yum install amazon-cloudwatch-agent -y 

# copying the cloudagent configuration file to ec2 server
sudo cp /home/ec2-user/webapp/cloudwatch-config.json /opt/aws/amazon-cloudwatch-agent/bin/cloudwatch-config.json

sudo mkdir -p /home/ec2-user/webapp/logs
sudo touch /home/ec2-user/webapp/logs/webapp.log
sudo chmod 775 /home/ec2-user/webapp/logs/webapp.log
