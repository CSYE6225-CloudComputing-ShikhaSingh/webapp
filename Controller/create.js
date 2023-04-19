
const {sequelize,User} = require('../models')
const express= require('express');
const router= express.Router();
var bcrypt = require('bcryptjs');
var auth= require('../auth/auth')
const logger = require('../logger');
router.use(express.json());

var Client = require('node-statsd');
const client = new Client("localhost", 8125);


//Unauthenticated Post Rest api to create users
router.post('/v2/user',async(req,res)=>{

    logger.info('POST USER API called - User creation process started');
    
    var userPostStartDate = new Date();
    client.increment("user_post_request");
    let {first_name,last_name,password,username}= req.body;

    if(first_name==undefined || last_name==undefined || password==undefined || username==undefined)
    {
        return res.status(400).json(
            {
                status:400,
                message:"Bad Request"
            }),
        logger.error("User Post method : Status code :400 - Bad request : " + "The value for any of the fields first name, last name, username and password is missing");

    }
    else{
       User.findOne({where:{username:req.body.username}}).then(user=>{
        if(user){
            return res.status(400).json({ message: 'Bad Request: Username already exists'}),
            logger.error("User Post method : Status code :400 - Bad request : Username already exist" );
        }
        else{ 
            const firstNameCheck= auth.nameCheck(first_name);
           if(firstNameCheck.status!=200)
           {
               return res.json(
                   {
                       status: 400,
                       message: firstNameCheck.message
                   }),
                logger.error("User Post method : Status code :400 - Bad request : "+ firstNameCheck.message );

           }
              
           const userNameCheck= auth.userNameCheck(username);
           if(userNameCheck.status!=200)
           {
               return res.json(
                   {
                       status: 400,
                       message: userNameCheck.message
                   }),
                logger.error("User Post method : Status code :400 - Bad request : "+ userNameCheck.message );

           }
              
           const passwordCheck= auth.passwordCheck(password);
           if(passwordCheck.status!=200)
           {
               return res.json(
                   {
                       status: 400,
                       message: passwordCheck.message
                   }),
                logger.error("User Post method : Status code :400 - Bad request : "+ passwordCheck.message );

           }
           try{
               let salt =  bcrypt.genSalt(10);
               let hashPassword =  bcrypt.hashSync(password, parseInt(salt));
               User.create({
                   first_name: first_name,
                   last_name: last_name, 
                   username: username,
                   password: hashPassword,
               }).then(user=>{
                res.status(201).json({
                    "id": user.id,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "username": user.username,
                    "account_created": user.createdAt,
                    "account_updated": user.updatedAt,
               }),
               logger.info("User Post method : Status code : 201 - Added the user " + user.username +" successfully")
            })}
           catch(err)
           {
               return res.status(400).json({
                   message:"User not successfully created",
                   error: err.message
               }),
               logger.error("User Post method : Status code : 400 - Error in adding the user " + err.message)

           }
        }
    
    })
} 

logger.info('Post user process ended');


})         


module.exports= router
