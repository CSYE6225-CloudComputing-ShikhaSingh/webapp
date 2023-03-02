const express= require('express');
const {Product}= require('../models')
const {User} = require('../models')
const router= express();
var bcrypt = require('bcryptjs');
const { Validator } = require('node-input-validator');
router.use(express.json());


router.post('/v1/product',(req,res)=>{
     const {name,description,sku,manufacturer,quantity}= req.body;
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
            if(err){
                    res.status(401).json({
                    message:'Unauthorized'
                })
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
                        if (!matched ) {
                            res.status(422).send(validator.errors);
                          }    
                          else{      
                                  
                        Product.findAll({where:{sku:sku}}).then((products)=>{
                        if(products[0]!=undefined)
                        {
                            res.status(400).json({
                                "message": "Product with this sku already exists"
                              })
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
                                })
                            })}
                            catch(err)
                            {
                                res.status(400).json({
                                    message:"Product not successfully created",
                                    error: err.message
                                })
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

                }
           })
       }
       else{
        res.status(404).json({
            "message": "User name doesn't exist"
          })
}
     })
     


})

module.exports= router