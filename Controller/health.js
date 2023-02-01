const express= require('express');
const router= express.Router();

//Unauthenticated  Rest api to check health of application

router.get('/healthz',(req,res)=>{

    res.status(200).json({
        status: 200,
        message:"/heathz is healthy"
    }
    );

})

module.exports= router;