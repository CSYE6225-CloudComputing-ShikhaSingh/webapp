const {sequelize,User} = require('../models')
const express= require('express');
const router= express.Router();
var bcrypt = require('bcryptjs');
var auth= require('../auth/auth')
const logger = require('../logger');
const Client = require('node-statsd');
const client = new Client("localhost", 8125);

router.use(express.json());

//Authenticated API- get request to retrieve user details

router.get('/v1/user/:userId',async(req,res)=>{

    logger.info('GET USER API called - finding user process started');
    client.increment("get_user_request");
    if(!req.headers.authorization || req.headers.authorization.indexOf('Basic')=== -1)
    {
        return res.status(401).json({
            message: 'Unauthorized'
          }),
        logger.error("User Get method: Error Status : 401 ,  Message : Missing Authorization Header");

    
    }
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');
    console.log(username)
    User.findAll({where:{username}}).then(users=>{
        if(users[0]!=undefined)
        {
            const db_password = users[0].password;
            bcrypt.compare(password,db_password,(err,result)=>{
                if(err)
                {
                    return res.status(401).json({
                        status: 401,
                        message:'Unauthorized'
                    }),
                    logger.error("User Get method: User authorization Error Status : 401" + err.message);


                }
                else if(users[0].id!=req.params.userId)
                {
                    return res.status(403).json({
                        message:'Forbidden'
    
                    }),
                    logger.error("User Get method: Error Status : 403" + username + " forbidden to make this request");

                }
                else if(result)
                {
                    res.status(200).json({
                        "id": users[0].id,
                        "first_name": users[0].first_name,
                        "last_name": users[0].last_name,
                        "username": users[0].username,
                        "account_created":users[0].createdAt,
                        "account_updated":users[0].updatedAt
                      
                      }),
                      logger.info("User Get Method : Status code 200 : User details retrieved successfully")
 
                }
                else{
                    res.status(401).json({
                        message: 'Unauthorized Access Denied'
                      })
                      logger.error("User Get method: Error Status : 401" + username + " is unauthorized to make this request");

                }
            })
    }
    else{
        return res.status(404).json({
            "message": "User name doesn't exist"
          }),
          logger.error("User Get method: Error Status : 404" + username + " does not exist in the system");

}
   
})
logger.info('GET USER API called - finding user process finished');

})

module.exports= router;


