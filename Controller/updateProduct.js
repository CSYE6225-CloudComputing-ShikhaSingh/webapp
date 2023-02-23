const express= require('express');
const {Product}= require('../models')
const {User} = require('../models')
const router= express();
const bcrypt= require('bcrypt');
const Op = require('sequelize').Op;
const { Validator } = require('node-input-validator');
const Joi = require('joi');

router.use(express.json());

//Authenticated API- get request to retrieve user details

router.put('/v1/product/:productId',async(req,res)=>{

    console.log(req.params.userId)
    if(!req.headers.authorization || req.headers.authorization.indexOf('Basic')=== -1)
    {
        return res.status(401).json({
            message: 'Unauthorized'
          })
    
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
                         if (!matched ) 
                          {
                            res.status(422).send(validator.errors);
                          }    
                          else{       
                             Product.findAll({where:{id:req.params.productId}}).then(product=>{ 
                             if(product[0]==undefined)  
                             {
                                return res.status(404).json({
                                    message: "Product with this id not found"
                                })
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
                                        })
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
                                      }))
                                 }
                                 } )
                                 }
                                 else{
                                    return res.status(403).json({
                                        status:403,
                                        message: "Forbidden"
                                         })
                                 }
                                }
    
    
                            })
                          }
                        })
                }
                else{
                    res.status(401).json({
                        message: 'Unauthorized Access Denied'
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


router.patch('/v1/product/:productId',async(req,res)=>{

    if(!req.headers.authorization || req.headers.authorization.indexOf('Basic')=== -1)
    {
        return res.status(401).json({
            message: 'Unauthorized'
          })
    
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
                    })
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
                        return res.status(400).json({ message: error.details[0].message });
                      }
                    
                         Product.findAll({where:{id:req.params.productId}}).then(product=>{
                        if(product[0].owner_user_id==undefined)
                        {
                            return res.status(400).json({
                                status:400,
                                message: "This record not found"
                            })
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
                                })
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
                                } 
                                catch(error)
                                {
                                    res.status(500).json({ error });
        
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
                                } 
                                catch(error)
                                {
                                    res.status(500).json({ error });
        
                                } 
                            }
                        }
                        else{
                            res.status(403).json({
                                status:403,
                                message: "Forbidden"
                            })
                        }
                           })
                }
                else{
                    res.status(401).json({
                        message: 'Unauthorized Access Denied'
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

module.exports= router;


