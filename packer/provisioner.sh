#!/bin/bash

# Update the system
sudo yum update -y

#upgrade the system Yum packages
sudo yum upgrade -y

sudo yum install ruby wget unzip -y

sleep 10

sudo yum install git make gcc -y

sudo amazon-linux-extras install epel -y
sudo yum install -y gcc-c++ make

#install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
. ~/.nvm/nvm.sh
#install node 16
nvm install 16
sudo ln -s "$(which node)" /usr/bin/node
echo "Node 16 is installed"
# check the version of node installed
node -e "console.log('Running Node.js ' + process.version)"

npm install -g pm2
echo "Installing unzip"
sudo yum makecache
sudo yum install unzip -y

ls
cd /tmp/
echo "$(pwd)"
ls
cp webapp.zip /home/ec2-user/
cd /home/ec2-user/
unzip -q webapp.zip
ls -ltr
chown ec2-user:ec2-user /home/ec2-user/webapp
cd webapp
ls -ltr 

npm i
sleep 30
pm2 start app.js
pm2 save
sudo ln -s /home/ec2-user/webapp/webapp.service /etc/systemd/system/webapp.service
sudo systemctl daemon-reload
sudo systemctl start webapp.service
sudo systemctl enable webapp.service
pm2 startup systemd
pm2 restart all --update-env

