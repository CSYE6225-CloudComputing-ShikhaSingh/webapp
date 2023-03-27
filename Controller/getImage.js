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
const logger = require('../logger');

var Client = require('node-statsd');
const client = new Client("localhost", 8125);

router.use(express.json());

router.get('/v1/product/:productId/image',(req,res)=>{

    logger.info('Get Image for the given product Id process started');
    client.increment("get_all_images_request");

    if(!req.headers.authorization || req.headers.authorization.indexOf('Basic')=== -1)
     {
         return res.status(401).json({
             message: 'Unauthorized'
           }),
           logger.error("Image Get method: Error Status : 401 ,  Message : Missing Authorization Header"),
           logger.info('Get Image to product process ended');   
     
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
                    return res.status(401).json({
                        message:'Unauthorized'
                    }),
                    logger.error("Image Get method: User authorization Error Status : 401" + err.message),
                    logger.info('Get Image to product process ended');   

                }
                else
                {
                     Product.findAll({where:{owner_user_id:users[0].id,id:req.params.productId}}).then((products)=>{
                     if(products!=undefined)
                     {
                        Image.findAll({where:{product_id:req.params.productId}})
                        .then((data)=>{
                         if(data[0]!=undefined)
                         {
                             const images= data.map((image)=>({
                             "image_id": image.image_id,
                             "product_id":image.product_id,
                             "file_name":image.file_name,
                             "date_created": image.date_created,
                             "s3_bucket_path": image.s3_bucket_path
                           })) ; 
                        res.status(200).json(images);
                        logger.info("Image Get Method : Status code 200 : Image details retrieved successfully")
                        logger.info('Get Image to product process ended');   
                         }
                         else{
                           res.status(404).json({
                           "status":404,
                           "message": "No image found for this product Id"
                          }),
                          logger.info("Image Get Method : Status code 404 : No image found for this product Id " + req.params.productId)
                          logger.info('Get Image to product process ended');   

                         }
                         })
                         
                       }
                      else{
                          res.status(403).json({
                            "message": "forbidden"
                        }),
                        logger.error("Image Get method: Error Status : 403" + username + " is forbidden to make this request");
                        logger.info('Get Image to product process ended');   

                        }
                  })
                }
            })
        }
        else{
            res.status(404).json({
                "message": "User name doesn't exist"
            }),
            logger.error("Image Get method: Error Status : 404" + username + " does not exist in the system");
            logger.info('Get Image to product process ended');   

        }
     })
    
})
router.get('/v1/product/:productId/image/:imageId',(req,res)=>{
    
    logger.info('Get Image for the given product Id with an image id process started');
    client.increment("get_image_by_id_request");

    if(!req.headers.authorization || req.headers.authorization.indexOf('Basic')=== -1)
    {
        return res.status(401).json({
            message: 'Unauthorized'
          }),
        logger.error("Image Get method: Error Status : 401 ,  Message : Missing Authorization Header"),
        logger.info('Get Image to product process ended');   

    
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
                   return res.status(401).json({
                       "message":'Unauthorized'
                   }),
                   logger.error("Image Get method: User authorization Error Status : 401" + err.message),
                   logger.info('Get Image to product process ended');   

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
                          logger.info("Image Get Method : Status code 200 : Image details retrieved successfully")
                          logger.info('Get Image to product process ended');   

                        }
                        else{
                          res.status(404).json({
                          "status":404,
                          "message": "No image found for this product Id"
                         }),
                         logger.info("Image Get Method : Status code 404 : No image found for this product Id " + req.params.productId)
                         logger.info('Get Image to product process ended');   

                        }
                        })
                        
                   }
                   else{
                         res.status(403).json({
                           "message": "forbidden"
                       }),
                       logger.error("Image Get method: Error Status : 403" + username + " is forbidden to make this request");
                       logger.info('Get Image to product process ended');   

                    }
                 })
               }
           })
       }
       else{
           res.status(404).json({
               "message": "User name doesn't exist"
           }),
           logger.error("Image Get method: Error Status : 404" + username + " does not exist in the system");
           logger.info('Get Image to product process ended');   


       }
    })

   
    
})

module.exports = router