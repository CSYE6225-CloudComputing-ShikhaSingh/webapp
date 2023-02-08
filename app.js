const { truncateSync } = require('fs');
var queryType = require('query-types');

const {sequelize} = require('./models')
const express= require('express');
const postRouter= require('./Controller/create');
const getRouter= require('./Controller/findUser');
const updateRouter= require('./Controller/update');
const updateProduct= require('./Controller/updateProduct');

const deleteProductRouter= require('./Controller/deleteProduct');
const health= require('./Controller/health');
const addProduct= require('./Controller/addProduct');
const getProduct= require('./Controller/getProduct');

require('dotenv').config();
const port= process.env.PORT || 3000


const app= express();
app.use(express.json());
app.use(queryType.middleware())

var validator = require("email-validator");
var passwordValidator = require('password-validator');
var schema = new passwordValidator();
var auth= require('./auth/auth')

//Unauthenticated Post Rest api to create users
app.use(postRouter);
app.use(getRouter);
app.use(getProduct);


// Authenticated API - put request to update user details
app.use(updateRouter);
app.use(updateProduct);
app.use(deleteProductRouter);
app.use(health);
app.use(addProduct);

const connectDb= async()=>{
    console.log("checking the database connection")
    try{
      await sequelize.authenticate();  
      console.log("Database connection established")
    }
    catch(e){
     console.log("Database connection failed")
     process.exit(1);
    }
}
//making a self executed function
(async()=>{
   await connectDb();
   console.log(`Attempting to run server on ${port}`)
   app.listen(port,()=>{
    console.log(`Server is running at ${port}`);

   })

})()
// app.listen({port:3030},async()=>{
//     console.log("Server is running at port 3030");
//     sequelize
//     .authenticate()
//     .then(() => {
//         console.log('Connection to the database has been established successfully.');
//     })
//     .catch(error => {
//         console.error(error);
//     });

// sequelize.sync();

    
// })

module.exports = app


