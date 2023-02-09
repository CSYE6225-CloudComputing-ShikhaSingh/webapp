const express= require('express');
const router= express.Router();


router.get('/v1/healthz',(req,res)=>{

    res.status(200).json({
        status: 200,
        message:"/heathz is healthy"
    }
    );

})

module.exports= router;