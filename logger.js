const { createLogger, format, transports } = require("winston");

const customFormat = format.combine(format.timestamp(), format.printf((info)=>{
   return `${info.timestamp} - [${info.level.toUpperCase().padEnd(7)}] - ${info.message}`
}))

  
const logger = createLogger({
    level: 'debug',  // to execute all logger level with debug ang log level above its priority
    format: customFormat,
    transports: [
        new transports.Console(),
        new transports.File({ filename: './logs/webapp.log' , level: 'info'}),
       // new transports.File({ filename: './logs/error.log' , level: 'error'})

    ],

  });
  

module.exports = logger ;