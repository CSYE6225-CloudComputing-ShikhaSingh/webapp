const Product = require('../models/product')
const Image = require('../models/image')
const AWS = require("aws-sdk");
const s3 = new AWS.S3();

function deleteFile(fileName){
    const params = {
         Bucket: "ssthakur-bucket",
         Key  :  fileName
    }    
  this.s3.deleteFile(params).promise();

}

module.exports= deleteFile
