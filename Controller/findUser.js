
const {sequelize,User} = require('../models')
const express= require('express');
const router= express.Router();
const bcrypt= require('bcrypt');
var auth= require('../auth/auth')
router.use(express.json());

///Authenticated API- get request to retrieve user details

router.get('/user/: ````````````````````````````````````````````````',async(req,res)=>{

    console.log(req.params.userId)
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
                if(err)
                {
                    res.status(401).json({
                        message:'Unauthorized'
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
                    res.status(200).json({
                        "id": users[0].id,
                        "first_name": users[0].first_name,
                        "last_name": users[0].last_name,
                        "username": users[0].username,
                        "account_created":users[0].createdAt,
                        "account_updated":users[0].updatedAt
                      
                      })
                }
                else{
                    res.status(401).json({
                        message: 'Unauthorized Access Denied'
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
