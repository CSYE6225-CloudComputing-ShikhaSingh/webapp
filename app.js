const {sequelize} = require('./models')
const express= require('express');

const bodyParser = require('body-parser');
const postRouter= require('./Controller/create');
const getRouter= require('./Controller/findUser');
const updateRouter= require('./Controller/update');
const updateProduct= require('./Controller/updateProduct');
const deleteProductRouter= require('./Controller/deleteProduct');
const health= require('./Controller/health');
const addProduct= require('./Controller/addProduct');
const getProduct= require('./Controller/getProduct');
const uploadImageRouter= require('./Controller/uploadImage')
const imageRouter= require('./Controller/getImage')
const deleteImageRouter= require('./Controller/deleteImage')
  
const port= process.env.PORT || 3000
const app= express();
const logger = require('./logger')

app.use(express.json());
app.use(bodyParser.json())
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
app.use('/',imageRouter);
app.use('/',uploadImageRouter);
app.use('/',deleteImageRouter);



app.listen({port:3030},async()=>{
    logger.info("Server is running at port 3030");
    sequelize
    .authenticate()
    .then(() => {
        logger.info('Connection to the database is established successfully.');
    })
sequelize.sync(); 
})

module.exports = app


