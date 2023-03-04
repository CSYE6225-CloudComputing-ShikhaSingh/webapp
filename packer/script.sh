#!/bin/bash

chmod 755 /home/ec2-user 
# sudo amazon-linux-extras enable postgresql14
# sudo yum install postgresql-server -y
# sudo postgresql-setup initdb
# sudo systemctl start postgresql
# sudo systemctl enable postgresql
# sudo systemctl status postgresql
# sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'pgadmin';"
# sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /var/lib/pgsql/data/postgresql.conf
# sudo sed -i '/^host\s\+all\s\+all\s\+127.0.0.1\/32\s\+ident/s/ident/trust/' /var/lib/pgsql/data/pg_hba.conf
# sudo sh -c "echo \"host    all          all            0.0.0.0/0   trust\" >> /var/lib/pgsql/data/pg_hba.conf"
# sudo systemctl restart postgresql
# sudo -u postgres psql -c "CREATE DATABASE cloudpostgres;"
# echo "postgres is successfully installed"
#sudo amazon-linux-extras install postgresql10
npm i multer-s3@2.10.0
npm install --save sequelize pg pg-hstore bcrypt
npm install -g sequelize-cli
# cd /home/ec2-user/webapp
# npx sequelize db:migrate
# psql -h csye6225.cgg6xlo0jdju.us-east-1.rds.amazonaws.com -P 5432 -u csye6225 -p homealone 
# psql --host=csye6225.cgg6xlo0jdju.us-east-1.rds.amazonaws.com --port=5432 --username=csye6225 --password --dbname=csye6225 


  






