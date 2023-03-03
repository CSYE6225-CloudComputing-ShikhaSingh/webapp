const express= require('express');
const multer = require('multer');
const AWS= require('aws-sdk');
const fs= require('fs')
const path= require('path')
const fileService= require('../Service/delete')
const {Image} = require('../models')
const {User} = require('../models')
const {Product} = require('../models')
var bcrypt = require('bcryptjs');

const router= express.Router();
const s3 = new AWS.S3();
router.use(express.json());


router.delete('/v1/product/:productId/image/:imageId',(req,res)=>{
    
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
                  Product.findAll({where:{owner_user_id:users[0].id,id:req.params.productId}}).then((products)=>{
                     if(products[0]!=undefined)
                     {
                        try{
                            console.log(req.params.imageId)
                            Image.findAll({where:{product_id:req.params.productId}})
                            .then((image)=>{
                                console.log(products[0].owner_user_id)
                        
                                 if(image[0]!=undefined)
                                 {
                                    let filename= image[0].file_name
                                    console.log(filename)
                                    let s3bucket = new AWS.S3({
                                        // accessKeyId: IAM_USER_KEY,
                                        // secretAccessKey: IAM_USER_SECRET,
                                        Bucket: process.env.S3_BUCKET_NAME
                                        });
                                        const params = {
                                        Bucket: process.env.S3_BUCKET_NAME,
                                        Key:   products[0].owner_user_id+'/'+ filename
                                    }    
                                s3bucket.deleteObject(params).promise();            
                                 Image.destroy(
                                    {
                                        where:{
                                            image_id: image[0].image_id
                                        }
                                    }
                                )
                                return res.status(204).json({
                                    "message": "Image deleted successfully"
                                })
                        
                                 }
                                 else{
                                   res.status(404).json({
                                    "message": "Image with this id not found"
                                     })
                                  }
                               })
                            }
                            catch(err)
                            {
                              res.status(500).json({
                                message: "There was an error deleting the image",
                              });
                        
                            }
                         
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





