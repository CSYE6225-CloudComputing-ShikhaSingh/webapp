let userRegExp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
var nameRegex= /^[a-z ,.'-]+$/i;
var passwordExpression = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
const  User = require("../models");



function nameCheck(first_name)
{
    if(first_name === undefined || first_name.length === 0)
    {
        return {
            status: 400,
            message: "You must enter first name"
        }
    }
    else if(!nameRegex.test(first_name))
    {
        return {
            status: 400,
            message: "First Name can contain only letters"
        }

    } 
    else{
        return{
            status: 200,
            message: "OK"

        }
    }   
}

function userNameCheck(username)
{
    //username validation
    if(username === undefined || username.length==0)
    {
        return {
             status: 400,
             message: "You must enter user name" 
            }
    }
    else if(!userRegExp.test(username))
    {
        return { status:400, message: "User Name format is invalid. You must have a valid domain name in user name" }

    }
    else{
        return{
            status: 200,
        }
             
    }

}
 function passwordCheck(password)
{

    //password validation
    
    if(password === undefined || password.length<6)
    {
        return { 
            status: 400,
            message: "Password field can not be empty and must have more than 6 characters"
         };
    }
    else if(!passwordExpression.test(password))
    {
        return { 
            status: 400,
            message: "Password should contain at least one number and one special character"
        };

    }
    else{
        return{
            status:200
        }
    }


}

module.exports={
    nameCheck,
    userNameCheck,
    passwordCheck,
}