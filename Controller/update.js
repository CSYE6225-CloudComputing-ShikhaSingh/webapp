
const {sequelize,User} = require('../models')
const express= require('express');
const router= express.Router();
var bcrypt = require('bcryptjs');
var auth= require('../auth/auth')
const Client = require('node-statsd');
const client = new Client("localhost", 8125);
const logger = require('../logger');

router.use(express.json());

router.put('/v1/user/:userId',async(req,res)=>{

    logger.info("Updating the user process started");
    client.increment("update_user_request");
    if(!req.headers.authorization || req.headers.authorization.indexOf('Basic')=== -1)
    {
        return res.status(401).json({
            message: 'Unauthorized'
          }),
        logger.error("User Put method: Header authorization Error Status : 401 Missing Authorization header in the request");

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
                console.log(result)
                if(err)
                {
                    res.status(401).json({
                        message:'Unauthorized'
                    })
                    logger.error("User Put method: Status code :401 - " + "Password authentication for the user failed. Please try with correct password");

                }
                else if(users[0].id!=req.params.userId)
                {
                    return res.status(403).json({
                        message:'Forbidden Request'
    
                    }),
                    logger.error("User Put method : Status code : 403 - the user " + username +" is forbidden to update the user details")


                }
                else if(result)
                {
                    let {first_name,last_name,password,username}= req.body;
                    const firstNameCheck= auth.nameCheck(first_name);
                   if(firstNameCheck.status!=200)
                   {
                       return res.json(
                           {
                               status: 400,
                               message: firstNameCheck.message
                           }),
                           logger.error("User Put method : Status code :400 - Bad request : "+ firstNameCheck.message );

                   }
                      
               
                   const passwordCheck= auth.passwordCheck(password);
                   if(passwordCheck.status!=200)
                   {
                       return res.json(
                           {
                               status: 400,
                               message: passwordCheck.message
                           }),
                           logger.error("User Put method : Status code :400 - Bad request : "+ passwordCheck.message );

                   }
                   
                       try
                       {
                        if (req.body.account_updated != undefined || req.body.account_created != undefined) {
                            return res.json(
                                {
                                    status: 400,
                                    message: "Bad Request"
                                }),
                                logger.error("User Put method : Status code :400 - Bad request , Message: Fields: date of account creation and date of account update can not be blank"  );

                            }
                        
                        let salt =  bcrypt.genSalt(10);
                        let hashPassword =  bcrypt.hashSync(password, parseInt(salt));
                        console.log(hashPassword);
                         const user= User.update({
                            "first_name": req.body.first_name,
                            "last_name": req.body.last_name,
                            "password": hashPassword,
                          },{where:{id:req.params.userId}})
                            
                            return  res.sendStatus(204),
                            logger.info("User Put method : Status code : 204 - Updated the user " + username +" successfully")


                        }
                        catch(err)
                        {
                            res.status(400).json({
                                message:"User not updated successfully",
                                error: err.message
                            });
                            logger.error("User Put method : Status code : 400 - the user " + username +" could not be updated successfully" + err.message)

                        }
                }
                else{
                    res.status(401).json({
                        message: 'Unauthorized'
                      }),
                      logger.error("User Put method : Status code : 401 - Error in updating the user " + username + " is not authorized to update this user")

        
                }
            })
    }
    else{
        res.status(404).json({
            "message": "User name doesn't exist"
          })
          logger.info("User Put method : Status code : 404 - the user " + username + " does not exist")

}
   
});
logger.info("Updating the user process ended");

})

module.exports= router;