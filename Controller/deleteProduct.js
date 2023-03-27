const express= require('express');
const {Product}= require('../models')
const {User} = require('../models')
const router= express();
var bcrypt = require('bcryptjs');
const AWS= require('aws-sdk');
const { Validator } = require('node-input-validator');
const {Image} = require('../models');
const logger = require('../logger');

var Client = require('node-statsd');
const client = new Client("localhost", 8125);

router.use(express.json());

// const BUCKET_NAME= "ssthakur-bucket" //process.env.S3_BUCKET_NAME
//   const IAM_USER_KEY="AKIAW5UOZK2CGLIED3F5"
//   const IAM_USER_SECRET="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"
const s3= new AWS.S3({
    // accessKeyId: IAM_USER_KEY,
    // secretAccessKey: IAM_USER_SECRET,
    Bucket: process.env.S3_BUCKET_NAME,
    region: process.env.AWS_REGION
})
router.delete('/v1/product/:productId',async(req,res)=>{
     
    logger.info('Delete Product API called - The process of deleting the product started');
    client.increment("delete_product_request");

    if(!req.headers.authorization || req.headers.authorization.indexOf('Basic')=== -1)
    {
        return res.status(401).json({
            message: 'Unauthorized'
          }),
          logger.error("Product Delete method: Header authorization Error Status : 401 Missing Authorization header in the request");
    
    }
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');
    User.findOne({where:{username}}).then((user)=>{
        console.log(user);
        if(user!=undefined)
        {
            const db_password= user.password;
            console.log(db_password)
            bcrypt.hash(password,10).then((password)=> console.log(password))
            const isValid= bcrypt.compareSync(password,db_password)
            if(isValid)
            {
                console.log('valid')
                Product.findOne({where:{id:req.params.productId}}).then((product)=>{
                    // console.log(product[0])
                    if(product!=undefined)
                    {
                        if(product["owner_user_id"]==user.id)
                        {

                            Image.findAll({where:{product_id:req.params.productId}}).then((images)=>{
                                images.forEach(image => {
                                    const params = {
                                        Bucket: "ssthakur-bucket",//process.env.S3_BUCKET_NAME,
                                        Key:   user.id+'/'+ image.file_name
                                    }  
                                    const key=    user.id+'/'+ image.file_name
                                    console.log(params);
                                    s3.deleteObject(params).promise();
                                    image.destroy();
                                });
                                 
                                
                            })
                             
                            product.destroy()
                            return res.status(200).send("product deleted"),
                            logger.info("Product Delete Method : Status code 200 : Product deleted successfully")
                        }
                        else{
                            return res.status(403).send("Forbidden"),
                            logger.error("Product Delete Method : Status code 403 : User is forbidden to delete this product")

                        }
                    }
                    else{
                        res.status(404).json("Product not found")
                        logger.info("Product Delete Method : Status code 403 : Product with id - "+ req.params.productId + " not found" )

                    }
                    
                })
            }
            else{
                return res.status(403).send("Forbidden"),
                logger.error("Product Delete Method : Status code 403 : User is forbidden to delete this product")

            }
        }
        else{
            res.status(404).json("user name does not exist")
            logger.error("Product Delete Method : Status code 404 : User " + username + " does not exist")

        }
    })
       
    })


module.exports= router;