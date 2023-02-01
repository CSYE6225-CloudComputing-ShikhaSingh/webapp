const { truncateSync } = require('fs');
const {sequelize,User} = require('./models')
const express= require('express');
const bcrypt= require('bcrypt');
const postRouter= require('./Controller/create');
const getRouter= require('./Controller/findUser');
const updateRouter= require('./Controller/update');
const health= require('./Controller/health');


const app= express();
app.use(express.json());
var validator = require("email-validator");
var passwordValidator = require('password-validator');
var schema = new passwordValidator();
var auth= require('./auth/auth')

//Unauthenticated Post Rest api to create users
app.use('/user',postRouter);

app.use(getRouter);

// Authenticated API - put request to update user details
app.use(updateRouter);

app.use(health);

app.listen({port:3030},async()=>{
    console.log("Server is running at port 3030");
    await sequelize.sync();
    await sequelize.authenticate()
    console.log("Database is connected")
    
})

module.exports = app


