const express= require('express');
const multer = require('multer');
const AWS= require('aws-sdk');
const fs= require('fs')
const path= require('path')
const {Image} = require('../models')
const {User} = require('../models')
const {Product} = require('../models')
var bcrypt = require('bcryptjs');

const { 
    v4: uuidv4
  } = require('uuid');



const s3 = new AWS.S3({
    region: 'us-east-1',
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
    cb(null, false);
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

router.post('/v1/product/:productId/image',upload.array('file',10),(req,res)=>{

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
      console.log(users[0])
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
               })
           }
           else if(result)
           {
            Product.findAll({where:{owner_user_id:users[0].id,id:req.params.productId}}).then((products)=>{
                if(products[0]!=undefined)
                {
                    const responses=[];
                    console.log(req.files.length)
                    for(var i=0;i<req.files.length;i++){
                        var file = req.files[i];
                        if(!file)
                        {
                            res.status(400).send({
                            message:"Bad Request (No file found to upload)"
                            })
                        }
                        if (!file.mimetype.startsWith("image/")) 
                        {
                          logger.info("Invalid file type");
                          return res.status(400).json({
                          error: "Bad Request (The file type is not supported)",
                           });
                        } 
                        else
                        {
                            const fileName = path.basename(file.originalname, path.extname(file.originalname)) + path.extname(file.originalname);
                            console.log('fileName: ', fileName)
                            fs.readFile(file.path,async(err,fileData)=>{
                                console.log("creating image")
               
                                if(!err)
                                {
                                    var params = {
                                    Bucket: process.env.S3_BUCKET_NAME ,
                                    Key: users[0].id+'/'+ fileName, //partitioning the images
                                    Body: fileData,
                                   };
               
                                   s3.upload(params,async(err,data)=>{

                                              const aws_metadata = JSON.parse(JSON.stringify(data));
                                              Image.create({
                                               product_id: req.params.productId,
                                               file_name: file.originalname,
                                               s3_bucket_path: aws_metadata.Location,
                                               date_created: new Date()}).then((data)=>{
                                                responses.push({
                                                    "image_id": data.image_id,
                                                     "product_id":data.product_id,
                                                     "file_name":data.file_name,
                                                      "date_created": data.date_created,
                                                      "s3_bucket_path": data.s3_bucket_path
                                                 })
                                                res.status(200).send(responses)
                                               })
                                                                           
                                   })          
                              }
                              else
                              {
                                res.status(403).json({
                                    "message": "forbidden"
                                })
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
                    })
                }
            })
    }
})
}
else
{
    res.status(404).json({
        "message": "User name doesn't exist"
    })
}
})
})

module.exports= router