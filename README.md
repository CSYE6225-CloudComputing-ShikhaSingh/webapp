# webapp

CSYE 6225 - Spring 2023

Welcome to Cloud Computing Course

I have created the repository "webapp" for the development of nodejs application

Assignment - 2:

The requirement is to create rest api for creating, retrieving and updating the details of users.

The below technology stack are utilized to acheive the requirement:

1. Backend: Javascript 
2. Framework: Node.js and express
3. Database: Postgresql
4. ORM: sequelize and sequelize-cli

Build instructions are as follow:

1. clone the project using git@github.com:CSYE6225-CloudComputing-ShikhaSingh/webapp.git 
2. use the below sequelizer commands to enable the connection of node js application with postgresql database

npm install --save sequelize
npm install --save pg pg-hstore # Postgres
npm install --save-dev sequelize-cli


// install on mac
brew services start postgresql
psql postgres
\conninfo


// create a database
npx sequelize db:create

// Connect to a database
\c cloud-postgres

// drop a database
npx sequelize db:drop

// Create a model file User in models folder and create a migration file with name like XXXXXXXXXXXXXX-create-user.js in migrations folder
npx sequelize-cli model:generate --name User --attributes first_name:string,last_name:string,password:string,username:string
 
//migrate the data from nodejs to postgres
npx sequelize db:migrate

// To undo most recent migration
npx sequelize-cli db:migrate:undo

Start the application:

npm start

Test the application:

npm test

Assignment 4:

In this assignment, we will be creating an Amazon Machine Image (AMI) for a Node.js application using Packer and then creating an EC2 instance using Terraform.

Prerequisites

1. An AWS account
2. Packer and Terraform installed on your machine
3. Git installed on your machine
4. Basic knowledge of Node.js, Packer, and Terraform

Step 1: Create an AMI with Packer

In the packer directory, create the aws-ami.pkr.hcl file

Modify the source_ami value to your desired base AMI.

Modify the ami_name value to your desired name for the created AMI.

Save and close the aws-ami.pkr.hcl file.

In the packer directory, run the following command to validate the Packer template:

packer validate aws-ami.pkr.hcl

If the validation is successful, run the following command to create the AMI:

packer build aws-ami.pkr.hcl

Once the AMI creation process is complete, take note of the created AMI ID. We will use this in the next step.

Step 3: Create an EC2 instance with Terraform

In the terraform directory, open the variables.tf file and modify the access_key and secret_key values with your AWS access key and secret key.

Modify the ami_id value with the AMI ID that was created in the previous step.

Save and close the variables.tf file.

Run the following command to initialize the Terraform directory:

terraform init

Run the following command to validate the Terraform configuration:

terraform validate

If the validation is successful, run the following command to create the EC2 instance:

terraform apply

When prompted to confirm the creation, enter yes.

Wait for the creation process to complete. Once complete, Terraform will output the public IP address of the created EC2 instance.

To destroy the created resources, run the following command:

terraform destroy

When prompted to confirm the destruction, enter yes.




