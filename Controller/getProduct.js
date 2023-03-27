const {sequelize,Product} = require('../models')
const express= require('express');
const router= express.Router();
var bcrypt = require('bcryptjs');
var auth= require('../auth/auth')
const logger = require('../logger');

var Client = require('node-statsd');
const client = new Client("localhost", 8125);

router.use(express.json());

router.get('/v1/product/:productId',(req,res)=>{
    
    logger.info('Get Product process started');
    client.increment("get_product_request");

   Product.findOne({where:{id:req.params.productId}}).then((product)=>{

    if(product!=undefined) {
        
        return res.status(200).json({
            "id": product.id,
            "name": product.name,
            "description": product.description,
            "sku": product.sku,
            "manufacturer": product.manufacturer,
            "quantity":product.quantity,
            "date_added": product.updatedAt,
            "date_last_updated": product.updatedAt,
            "owner_user_id": product.owner_user_id
       }),
       logger.info("Product Get Method, Status code : 200 , Message: Product details retrieved successfully")
    }
    else{
        res.status(404).json({
            "status":404,
            "message": "Product with this id not found"
          }),
          logger.info("Product Get Method, Status code : 404 , Message: Product with id " + req.params.productId + " not found")
    }
     

})
})

module.exports= router