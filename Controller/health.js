const express= require('express');
const router= express.Router();
const logger = require('../logger');

var Client = require('node-statsd');
const client = new Client("localhost", 8125);

router.get('/v1/healthz',(req,res)=>{

    logger.info("Application health check started")
    client.increment(req.method + "" + req.url);

    res.status(200).json({
        status: 200,
        message:"/heathz is healthy"
    })
    logger.info("Health check Status Code : 200 , message : Application is healthy")

})

module.exports= router;