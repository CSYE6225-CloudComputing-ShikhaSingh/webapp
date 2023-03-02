const express= require('express')
const {
    v4: uuidv4
} = require('uuid');
const router= express.Router();
const AWS= require('aws-sdk');
const Product = require('../models/product')
const Image = require('../models/image')
const fs= require('fs')

//upload a document
const fileUpload= async(file)=>{
    fs.readFileSync(source, async(err,fileData)=>{
        if(!err)
        {
            var product= Product.findOne({
                where:{id:req.params.productId}
            })

            const params={
                Bucket: "ssthakur-bucket",                
                Key: uuid.v4() + '/' + fileName,
                Body: fileData
            }

            s3.upload(params, function(err, data) {
                console.log(err, data);
                if(err)
                {
                    res.status(500).send({
                        message: err
                    });
                }
                else{
                     const aws_metadata= JSON.parse(JSON.stringify(data))
                     console.log(aws_metadata)
                     const image = Image.build({
                        image_id: uuid.v4(),
                        product_id: req.params.productId,
                        file_name: file.originalname,
                        s3_bucket_path: aws_metadata.Location,
                        date_created: new Date(),
                      });
                
                     Image.save(image)
                     .then(data=>{
                        res.status(201).send({
                            image_id: data.image_id,
                            product_id:data.product_id,
                            file_name:data.file_name,
                            date_created: data.date_created,
                            s3_bucket_path: data.s3_bucket_path
                        })
                     }).catch(err => {
                        res.status(500).send({
                            message: err.message || "Some error occurred while creating the image!"
                        });
                    });
                }
               });
        }
        else{
            res.status(500).send({
                message: "Some error occurred while uploading the image!"
            });
        }
    })
}

module.exports= fileUpload

