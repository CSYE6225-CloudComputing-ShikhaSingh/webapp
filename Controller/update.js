
const {sequelize,User} = require('../models')
const express= require('express');
const router= express.Router();
const bcrypt= require('bcrypt');
var auth= require('../auth/auth')
router.use(express.json());


router.put('/user/:userId',async(req,res)=>{

    if(!req.headers.authorization || req.headers.authorization.indexOf('Basic')=== -1)
    {
        return res.status(401).json({
            message: 'Unauthorized'
          })
    
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
                    res.status(400).json({
                        message:'Bad Request'
                    })
                }
                else if(users[0].id!=req.params.userId)
                {
                    return res.status(403).json({
                        message:'Forbidden Request'
    
                    })
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
                           })
                   }
                      
                //    const userNameCheck= auth.userNameCheck(username);
                //    if(userNameCheck.status!=200)
                //    {
                //        return res.json(
                //            {
                //                status: 400,
                //                message: userNameCheck.message
                //            })
                //    }
                      
                   const passwordCheck= auth.passwordCheck(password);
                   if(passwordCheck.status!=200)
                   {
                       return res.json(
                           {
                               status: 400,
                               message: passwordCheck.message
                           })
                   }
                   
                       try
                       {
                        if (req.body.username != undefined || req.body.account_updated != undefined || req.body.account_created != undefined) {
                            return res.json(
                                {
                                    status: 400,
                                    message: "Bad Request"
                                })                          }
                        let salt =  bcrypt.genSalt(10);
                        let hashPassword =  bcrypt.hashSync(password, parseInt(salt));
                        console.log(hashPassword);
                         const user= User.update({
                            "first_name": req.body.first_name,
                            "last_name": req.body.last_name,
                            "password": hashPassword,
                          },{where:{id:req.params.userId}})
                            
                            return  res.sendStatus(204);

                        }
                        catch(err)
                        {
                            res.status(400).json({
                                message:"User not successfully created",
                                error: err.message
                            })
                        }
                }
                else{
                    res.status(401).json({
                        message: 'Unauthorized'
                      })
        
                }
            })
    }
    else{
        res.status(404).json({
            "message": "User name doesn't exist"
          })
}
   
})
})

module.exports= router;