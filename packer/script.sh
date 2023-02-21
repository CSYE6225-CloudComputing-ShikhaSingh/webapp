#!/bin/bash

#install and configure postgres
echo "Installing postgres"
chmod 755 /home/ec2-user 
sudo amazon-linux-extras enable postgresql14
sudo yum install postgresql-server -y
sudo postgresql-setup initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo systemctl status postgresql
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'pgadmin';"
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /var/lib/pgsql/data/postgresql.conf
sudo sed -i '/^host\s\+all\s\+all\s\+127.0.0.1\/32\s\+ident/s/ident/trust/' /var/lib/pgsql/data/pg_hba.conf
sudo sh -c "echo \"host    all          all            0.0.0.0/0   trust\" >> /var/lib/pgsql/data/pg_hba.conf"
sudo systemctl restart postgresql
sudo -u postgres psql -c "CREATE DATABASE cloudpostgres;"
echo "postgres is successfully installed"
npm install --save sequelize pg pg-hstore
sudo npm install -g sequelize-cli
cd /home/ec2-user/webapp
npx sequelize db:migrate









