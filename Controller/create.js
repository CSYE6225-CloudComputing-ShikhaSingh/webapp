
const {sequelize,User} = require('../models')
const express= require('express');
const router= express.Router();
const bcrypt= require('bcrypt');
var auth= require('../auth/auth')
router.use(express.json());

//Unauthenticated Post Rest api to create users
router.post('/',async(req,res)=>{
    
    console.log(req.body.username)

    User.findOne({where:{username:req.body.username}}).then(user=>{
        if(user){
            return res.status(400).json({msg: 'Bad Request: Username already exists'});
        }
        else{
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
              
           const userNameCheck= auth.userNameCheck(username);
           if(userNameCheck.status!=200)
           {
               return res.json(
                   {
                       status: 400,
                       message: userNameCheck.message
                   })
           }
              
           const passwordCheck= auth.passwordCheck(password);
           if(passwordCheck.status!=200)
           {
               return res.json(
                   {
                       status: 400,
                       message: passwordCheck.message
                   })
           }
           try{
               let salt =  bcrypt.genSalt(10);
               let hashPassword =  bcrypt.hashSync(password, parseInt(salt));
               console.log(hashPassword);
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
               })
           })}
           catch(err)
           {
               res.status(400).json({
                   message:"User not successfully created",
                   error: err.message
               })
           }
        }
    
    })
    
})         


module.exports= router
