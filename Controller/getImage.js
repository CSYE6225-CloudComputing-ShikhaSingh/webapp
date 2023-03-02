const express= require('express');
const multer = require('multer');
const AWS= require('aws-sdk');
const fs= require('fs')
const path= require('path')
const {User} = require('../models')
const {Product} = require('../models')
const {Image} = require('../models')
const router= express.Router();
var bcrypt = require('bcryptjs');

router.use(express.json());

router.get('/v1/product/:productId/image',(req,res)=>{
    if(!req.headers.authorization || req.headers.authorization.indexOf('Basic')=== -1)
     {
         return res.status(401).json({
             message: 'Unauthorized'
           })
     
     }   
     const base64Credentials = req.headers.authorization.split(' ')[1];
     const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
     const [username, password] = credentials.split(':');
     User.findAll({where:{username:username}}).then((users)=>{
        if(users[0]!=undefined)
        {
            const db_password = users[0].password;
            bcrypt.compare(db_password,password,(err,result)=>{
                if(err)
                {
                    res.status(401).json({
                        message:'Unauthorized'
                    })
                }
                else
                {
                    console.log("i am here")

                     Product.findAll({where:{owner_user_id:users[0].id,id:req.params.productId}}).then((products)=>{
                     if(products!=undefined)
                     {
                        Image.findAll({where:{product_id:req.params.productId}})
                        .then((data)=>{
                         if(data[0]!=undefined)
                         {
                           console.log(data)
                        //      res.status(200).json({
                        //      "image_id": data[0].image_id,
                        //      "product_id":data[0].product_id,
                        //      "file_name":data[0].file_name,
                        //      "date_created": data[0].date_created,
                        //      "s3_bucket_path": data[0].s3_bucket_path
                        //    })  
                        res.status(200).send(data)

                         }
                         else{
                           res.status(404).json({
                           "status":404,
                           "message": "No image found for this product Id"
                          })
                         }
                         })
                         
                       }
                      else{
                          res.status(403).json({
                            "message": "forbidden"
                        })
                        }
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
router.get('/v1/product/:productId/image/:imageId',(req,res)=>{
    
    if(!req.headers.authorization || req.headers.authorization.indexOf('Basic')=== -1)
    {
        return res.status(401).json({
            message: 'Unauthorized'
          })
    
    }   
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');
    User.findAll({where:{username:username}}).then((users)=>{
       if(users[0]!=undefined)
       {
           const db_password = users[0].password;
           bcrypt.compare(db_password,password,(err,result)=>{
               if(err)
               {
                   console.log("i am here")
                   res.status(401).json({
                       "message":'Unauthorized'
                   })
               }
               else
               {
                 Product.findAll({where:{owner_user_id:users[0].id,id:req.params.productId}}).then((products)=>{
                    if(products[0]!=undefined)
                    {
                       console.log(products[0])
                       Image.findAll({where:{image_id:req.params.imageId,product_id:req.params.productId}})
                       .then((data)=>{
                        if(data[0]!=undefined)
                        {
                          console.log(data)
                            res.status(200).send({
                            "image_id": data[0].image_id,
                            "product_id":data[0].product_id,
                            "file_name":data[0].file_name,
                            "date_created": data[0].date_created,
                             "s3_bucket_path": data[0].s3_bucket_path
                          })  
                        }
                        else{
                          res.status(404).json({
                          "status":404,
                          "message": "No image found for this product Id"
                         })
                        }
                        })
                        
                   }
                   else{
                         res.status(403).json({
                           "message": "forbidden"
                       })
                    }
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

module.exports = router