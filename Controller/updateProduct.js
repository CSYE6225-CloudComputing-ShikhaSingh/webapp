const express= require('express');
const {Product}= require('../models')
const {User} = require('../models')
const router= express();
var bcrypt = require('bcryptjs');
const Op = require('sequelize').Op;
const { Validator } = require('node-input-validator');
const Joi = require('joi');
const logger = require('../logger');

var Client = require('node-statsd');
const client = new Client("localhost", 8125);

router.use(express.json());

//Authenticated API- get request to retrieve user details

router.put('/v2/product/:productId',async(req,res)=>{

    logger.info("Update Product process started")
    client.increment("update_product_request");
    
    console.log(req.params.userId)
    if(!req.headers.authorization || req.headers.authorization.indexOf('Basic')=== -1)
    {
        return res.status(401).json({
            message: 'Unauthorized'
          }),
        logger.error("Product Put method: Header authorization Error Status : 401 Missing Authorization header in the request");

    
    }
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');
    console.log(username)
    User.findAll({where:{username}}).then(users=>{
        if(users[0]!=undefined)
        {
            const db_password = users[0].password;
            bcrypt.compare(password,db_password,(err,result)=>{
                if(err)
                {
                    res.status(401).json({
                        status: 401,
                        message:'Unauthorized'
                    }),
                    logger.error("Product Put method: Status code :401 - " + "Password authentication for the user failed. Please try with correct password");

                }
                
                else if(result)
                {
                    const validator= new Validator(req.body,{
                        name: 'required',
                        description:'required',
                        sku:'required',
                        manufacturer:'required',
                        quantity:'required|integer|min:0|max:100'
                       })
                       validator.check().then((matched)=>{
                         if (!matched ) 
                          {
                            res.status(422).send(validator.errors);
                            logger.error("Product Update method: Status code :422 - " + validator.errors)

                          }    
                          else{       
                             Product.findAll({where:{id:req.params.productId}}).then(product=>{ 
                             if(product[0]==undefined)  
                             {
                                return res.status(404).json({
                                    message: "Product with this id not found"
                                }),
                                logger.error("Product Update method: Status code :422 - " + validator.errors)

                             }
                             else 
                             {
                               if(product[0].owner_user_id==users[0].id)
                               {
                                 Product.findAll({where:{
                                 sku: req.body.sku,
                                 id: { [Op.ne]: req.params.productId }
                                  }}).then((duplicateProduct)=>{
                                  console.log(duplicateProduct.length)
                                  if(duplicateProduct.length!=0)
                                  {
                                      return res.status(400).json({
                                       status:400,
                                       message: "Product with this sku already exists"
                                        }),
                                       logger.error("Product Post method: Status code : 400 - Product with the requested sku already exists in the system")

                                  }
                                 else if(duplicateProduct.length==0)
                                 {
                                    Product.update({
                                    name: req.body.name,
                                    description: req.body.description, 
                                    sku: req.body.sku,
                                     manufacturer: req.body.manufacturer,
                                     quantity: req.body.quantity,
                                     owner_user_id:users[0].id
                                     },{where:{id:req.params.productId}}).then((updatedProduct=>{
                                      res.status(204).send("Product is updated")
                                      logger.info("Product Update method : Status code : 204 - Updated the product " + product.name + " for the authorized user with email " + username + " successfully")

                                      }))

                                 }
                                 } )
                                 }
                                 else{
                                    return res.status(403).json({
                                        status:403,
                                        message: "Forbidden"
                                         }),
                                         logger.error("Product Put method: Status code :401 " + username + " is forbidden to perform this action");
                                 }
                                }
    
    
                            })
                          }
                        })
                }
                else{
                    res.status(401).json({
                        message: 'Unauthorized Access Denied'
                      }),
                      logger.error("Product Put method: Status code :401 " + username + " is unauthorized to perform this action");

        
                }
            })
    }
    else{
        res.status(404).json({
            "message": "User name doesn't exist"
          }),
          logger.error("Product Put method: Status code :401 " + username + " does not exist");

}
   
})
})


router.patch('/v1/product/:productId',async(req,res)=>{

    if(!req.headers.authorization || req.headers.authorization.indexOf('Basic')=== -1)
    {
        return res.status(401).json({
            message: 'Unauthorized'
          }),
          logger.error("Product Put method: Header authorization Error Status : 401 Missing Authorization header in the request");

    
    }
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');
    User.findAll({where:{username}}).then(users=>{
        if(users[0]!=undefined)
        {
            const db_password = users[0].password;
            bcrypt.compare(password,db_password,(err,result)=>{
                if(err)
                {
                    res.status(401).json({
                        status: 401,
                        message:'Unauthorized'
                    }),
                    logger.error("Product Put method: Status code :401 - " + err.message);

                }
                else if(result)
                {
                    const patchSchema = Joi.object({
                        name: Joi.string().optional(),
                        description: Joi.string().optional(),
                        sku: Joi.string().optional(),
                        manufacturer: Joi.string().optional(),
                        quantity: Joi.number().integer().min(0).max(100).optional()
                      });
                      
                      const { error } = patchSchema.validate(req.body);
                      if (error) {
                        return res.status(400).json({ message: error.details[0].message }),
                        logger.error("Product Post method: Status code : 400 "+ error.message)

                      }
                    
                         Product.findAll({where:{id:req.params.productId}}).then(product=>{
                        if(product[0].owner_user_id==undefined)
                        {
                            return res.status(400).json({
                                status:400,
                                message: "This record not found"
                            }),
                            logger.error("Product Post method: Status code : 400 - Product with this owner could not be found in the system")

                        }
                        else if(product[0].owner_user_id==users[0].id)
                        {
                           if(req.body.sku!=undefined)
                           {
                              Product.findAll({where:{
                              sku: req.body.sku,
                              id: { [Op.ne]: req.params.productId }
                              }}).then((duplicateProduct)=>{
                              console.log(duplicateProduct.length)
                               if(duplicateProduct.length!=0)
                               {
                               return res.status(400).json({
                                    status:400,
                                    message: "Product with this sku already exists"
                                }),
                                logger.error("Product Post method: Status code : 400 - Product with the requested sku already exists in the system")

                               }
                               else if(duplicateProduct.length==0)
                               {
                                console.log("iam here")
                                const updateOps = {};
                                for (const ops of Object.keys(req.body)) {
                                  updateOps[ops.propName] = ops.valueOf;
                                } 
                                try{
                                    const product= Product.update(req.body,{where:{ id: req.params.productId }} )
                                    res.status(200).json({
                                        message: 'Product updated',
                                      });
                                      logger.info("Product Update method : Status code : 200 - Updated the product " + product.name + " for the authorized user with email " + username + " successfully")

                                } 
                                catch(error)
                                {
                                    res.status(500).json({ error });
                                    logger.error("Product Put method: Status code :500 " + error.message);

                                }                       
                                
                                }
                            
                            } )
                            }
                            else{
                                try{
                                    const product= Product.update(req.body,{where:{ id: req.params.productId }} )
                                    res.status(200).json({
                                        message: 'Product updated',
                                      });
                                      logger.info("Product Update method : Status code : 200 - Updated the product " + product.name + " for the authorized user with email " + username + " successfully")

                                } 
                                catch(error)
                                {
                                    res.status(500).json({ error });
                                    logger.error("Product Put method: Status code :500 " + error.message);

                                } 
                            }
                        }
                        else{
                            res.status(403).json({
                                status:403,
                                message: "Forbidden"
                            }),
                            logger.error("Product Put method: Status code :401 " + username + " is forbidden to perform this action");

                        }
                           })
                }
                else{
                    res.status(401).json({
                        message: 'Unauthorized Access Denied'
                      }),
                      logger.error("Product Put method: Status code :401 " + username + " is unauthorized to perform this action");

        
                }
            })
    }
    else{
        res.status(404).json({
            "message": "User name doesn't exist"
          }),
          logger.error("Product Put method: Status code :401 " + username + " does not exist");

       }
   
})
})

module.exports= router;


