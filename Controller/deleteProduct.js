const express= require('express');
const {Product}= require('../models')
const {User} = require('../models')
const router= express();
const bcrypt= require('bcrypt');
const { Validator } = require('node-input-validator');
router.use(express.json());

router.delete('/v1/product/:productId',async(req,res)=>{
     
    console.log(req.params.productId);
    if(!req.headers.authorization || req.headers.authorization.indexOf('Basic')=== -1)
    {
        return res.status(401).json({
            message: 'Unauthorized'
          })
    
    }
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');
    User.findAll({where:{username}}).then((user)=>{
        console.log(user[0])
        if(user[0]!=undefined)
        {
            const db_password= user[0].password;
            console.log(db_password)
            bcrypt.hash(password,10).then((password)=> console.log(password))
            const isValid= bcrypt.compareSync(password,db_password)
            if(isValid)
            {
                console.log('valid')
                Product.findAll({where:{id:req.params.productId}}).then((product)=>{
                    console.log(product[0])
                    if(product[0]!=undefined)
                    {
                        if(product[0]["owner_user_id"]==user[0].id)
                        {
                            product[0].destroy()
                            return res.status(200).send("product deleted")
                            
                        }
                        else{
                            return res.status(403).send("Not allowed")
                        }
                    }
                    else{
                        res.status(404).json("Product not found")
                    }
                    
                })
            }
            else{
                return res.status(403).send("Forbidden")
            }
        }
        else{
            res.status(404).json("user name does not exist")
        }
    })
       
    })


module.exports= router;