# webapp

CSYE 6225 - Spring 2023

Welcome to Cloud Computing Course

I have created the repository "webapp" and it has two branches "main" and "assignment1"

Assignment - 1:

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



