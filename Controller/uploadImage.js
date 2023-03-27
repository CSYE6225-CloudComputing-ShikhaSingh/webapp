const express= require('express');
const multer = require('multer');
const AWS= require('aws-sdk');
const fs= require('fs')
const path= require('path')
const {Image} = require('../models')
const {User} = require('../models')
const {Product} = require('../models')
var bcrypt = require('bcryptjs');
const logger = require('../logger');

const Client = require('node-statsd');
const client = new Client("localhost", 8125);

const { 
    v4: uuidv4
  } = require('uuid');

  AWS.config.update({
    region: process.env.AWS_REGION
  })
  
const s3 = new AWS.S3({
    region: process.env.AWS_REGION,
    Bucket: process.env.S3_BUCKET_NAME

})
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now())
    }
  })



const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    //Accept a file
    cb(null, true);
  }
  else {
    //reject a file
    return cb(new Error('Only image files are allowed!'), false),
    logger.error("Image Post method: Error Status : 400 , Message : File format is not supported"),
    logger.info('Add Image to product process ended');   

  }
}
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
})

const router= express.Router();

var image_post_request = 0;

router.post('/v1/product/:productId/image',upload.array('file',10),(req,res)=>{

    logger.info(' Upload image for the given product Id process started');
    client.increment("upload_image_request");
    
    if(!req.headers.authorization || req.headers.authorization.indexOf('Basic')=== -1)
    {
        return res.status(401).json({
            message: 'Unauthorized'
          }),
        logger.warn("Image Post method: Error Status : 401 Missing Authorization header in the request"),
        logger.info('Add Image to product process ended');   
    }
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');


    User.findAll({where:{username:username}}).then((users)=>{
      if(users[0]!=undefined)
      {
          console.log(users[0].id)
          const db_password = users[0].password;
          console.log(db_password)
          bcrypt.compare(password,db_password,(err,result)=>{
           if(err)
           {
                   res.status(401).json({
                   message:'Unauthorized'
               }),
               logger.error("Image Post method: Error Status : 401 " + err.message);
               logger.info('Add Image to product process ended');   

           }
           else if(result)
           {
            Product.findAll({where:{owner_user_id:users[0].id,id:req.params.productId}}).then((products)=>{
                if(products[0]!=undefined)
                {
                    for(var i=0;i<req.files.length;i++){
                        var file = req.files[i];
                        if(!file)
                        {
                            res.status(400).send({
                            message:"Bad Request (No file found to upload)"
                            }),
                            logger.error("Image Post method: Error Status : 400 , Message : No file found to upload");
                            logger.info('Add Image to product process ended');   

                        }
                        // if (!file.mimetype.startsWith("image/")) 
                        // {
                        //   logger.info("Invalid file type");
                        //   return res.status(400).json({
                        //   error: "Bad Request (The file type is not supported)",
                        //    }),
                        //    logger.error("Image Post method: Error Status : 400 , Message : File format is not supported"),
                        //    logger.info('Add Image to product process ended');   

                        // } 
                        else
                        {
                            const fileName = path.basename(file.originalname, path.extname(file.originalname)) + path.extname(file.originalname);
                            console.log('fileName: ', fileName)
                            fs.readFile(file.path,async(err,fileData)=>{
                                console.log("creating image")
                                new_file_uuid = uuidv4();
                                if(!err)
                                {
                                    var params = {
                                    Bucket: process.env.S3_BUCKET_NAME ,
                                    Key: users[0].id+'/'+ new_file_uuid + '/' + fileName, //partitioning the images
                                    Body: fileData,
                                   };
               
                                   s3.upload(params,async(err,data)=>{

                                              const aws_metadata = JSON.parse(JSON.stringify(data));
                                              Image.create({
                                               product_id: req.params.productId,
                                               file_name: file.originalname,
                                               s3_bucket_path: aws_metadata.Location,
                                               date_created: new Date()}).then((data)=>{
                                                res.status(200).send({
                                                    "image_id": data.image_id,
                                                     "product_id":data.product_id,
                                                     "file_name":data.file_name,
                                                      "date_created": data.date_created,
                                                      "s3_bucket_path": data.s3_bucket_path
                                                 })
                                               }),
                                               logger.info("Image Post method : Status code : 200 - Added the image for the " + products[0].name + " for the authorized user with email " + username + " successfully")
                                               logger.info('Add Image to product process ended');   


                                                                           
                                   })          
                              }
                              else
                              {
                                res.status(403).json({
                                    "message": "forbidden"
                                }),
                                logger.error("Image Post method: Status code :403 " + username + " is forbidden to perform this action");
                                logger.info('Add Image to product process ended');   

                              }
                              
                        })


                    
    
                   }  
                  // promises.push(s3.upload(params).promise())
                    }
                   //  var result= JSON.parse(responses)
                     // res.status(200).send(JSON.stringify(responses));
                    // Image.findAll({where:{product_id:req.params.productId}}).then((data)=>{
                    //     res.status(201).send(data)
                    // })
                }
                else
                {
                    res.status(403).json({
                        "message": "forbidden"
                    }),
                    logger.error("Image Post method: Status code :403 " + username + " is forbidden to perform this action");
                    logger.info('Add Image to product process ended');   

                }
            })
    }
})
}
else
{
    res.status(404).json({
        "message": "User name doesn't exist"
    }),
    logger.warn("Image Post method: Status code :404 " + username + " does not exist");
    logger.info('Add Image to product process ended');   

}
})
})

module.exports= router