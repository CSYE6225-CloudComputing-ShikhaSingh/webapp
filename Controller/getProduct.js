const {sequelize,Product} = require('../models')
const express= require('express');
const router= express.Router();
const bcrypt= require('bcrypt');
var auth= require('../auth/auth')
router.use(express.json());

router.get('/v1/product/:productId',(req,res)=>{
   Product.findOne({where:{id:req.params.productId}}).then((product)=>{
    
    if(product!=undefined)
    {
        return res.status(200).json({
            "id": product.id,
            "name": product.name,
            "description": product.description,
            "sku": product.sku,
            "manufacturer": product.manufacturer,
            "date_added": product.updatedAt,
            "date_last_updated": product.updatedAt,
             "owner_user_id": product.owner_user_id
       })  
    }
    else{
        res.status(404).json({
            "status":404,
            "message": "Product with this id not found"
          })
    }
     

})
})

module.exports= router