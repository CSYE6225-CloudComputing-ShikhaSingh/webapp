const express= require('express');
const {Product}= require('../models')
const {User} = require('../models')
const logger = require('../logger');
const router= express();
var bcrypt = require('bcryptjs');
const { Validator } = require('node-input-validator');


const Client = require('node-statsd');
const client = new Client("localhost", 8125);

router.use(express.json());

router.post('/v1/product',(req,res)=>{

     logger.info('POST Product API called - Product creation process started');

     client.increment("product_post_request");

     const {name,description,sku,manufacturer,quantity}= req.body;

     if(!req.headers.authorization || req.headers.authorization.indexOf('Basic')=== -1)
     {
         return res.status(401).json({
             message: 'Missing Authorization Header'
           }),
        logger.error("Product Post method: Header authorization Error Status : 401 Missing Authorization header in the request");
     }
     const base64Credentials = req.headers.authorization.split(' ')[1];
     const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
     const [username, password] = credentials.split(':');
     User.findAll({where:{username:username}}).then((users)=>{

       if(users[0]!=undefined)
       {
           logger.info("Product Post method: Status code :200 - Finding the user name in the system")
           const db_password = users[0].password;
           bcrypt.compare(password,db_password,(err,result)=>{
            if(err){
                    res.status(401).json({
                    message:'Unauthorized'
                }),
                logger.error("Product Post method: Status code :401 - " + "Password authentication for the user failed. Please try with correct password");
              }
             else if(result)
                {
                    if (isNaN(req.body.quantity)) {
                        return res.status(400).send('Quantity must be a number');
                      }                    
                    const validator= new Validator(req.body,{
                        name: 'required',
                        description:'required',
                        sku:'required',
                        manufacturer:'required',
                        quantity:'required|integer|min:0|max:100'
                    })
                    validator.check().then((matched)=>{
                        if (!matched ) {
                            res.status(422).send(validator.errors);
                            logger.info("Product Post method: Status code :422 - " + validator.errors)

                          }    
                          else{      
                                  
                        Product.findAll({where:{sku:sku}}).then((products)=>{
                        if(products[0]!=undefined)
                        {
                            res.status(400).json({
                                "message": "Product with this sku already exists"
                              }),
                            logger.error("Product Post method: Status code : 400 - Product with the requested sku already exists in the system")
                        }
                        else{
                            
                            try{
                                Product.create({
                                    name: name,
                                    description: description, 
                                    sku: sku,
                                    manufacturer: manufacturer,
                                    quantity: quantity,
                                    owner_user_id: users[0].id

                                }).then(product=>{
                                 res.status(201).json({
                                     "id": product.id,
                                     "name": product.name,
                                     "description": product.description,
                                     "sku": product.sku,
                                     "manufacturer": product.manufacturer,
                                     "quantity":product.quantity,
                                     "date_added": product.updatedAt,
                                     "date_last_updated": product.updatedAt,
                                      "owner_user_id": users[0].id
                                }),
                                logger.info("Product Post method : Status code : 201 - Added the product " + product.name + " for the authorized user with email " + username + " successfully")
                            })}
                            catch(err)
                            {
                                res.status(400).json({
                                    message: err.message,
                                    error: err.message
                                }),
                                logger.error("Product Post method : Status code : 400 - Error in adding the product " + err.message)
                            }                        
                        }
                    })
                }
            })
                }
                else
                {
                    res.status(401).json({
                        message:"Unauthorized",
                    })
                    logger.error("Product Post method : Status code : 401 - Error in adding the product " + username + " is not authorized to add this product")

                }
           })
       }
       else{
        res.status(404).json({
            "message": "User name doesn't exist"
          }),
          logger.error("Product Post method : Status code : 401 - Error in adding the product " + username + " does not exist")

}
     })
     


})

module.exports= router