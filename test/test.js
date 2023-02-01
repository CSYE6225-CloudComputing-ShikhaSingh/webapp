const request = require("supertest");
const app = require("../app.js");
const  {User}  = require("../models");
const { expect } = require("chai");

let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();

const assert = require('chai').assert;

chai.use(chaiHttp);

describe("First Unit Test", () => {
    //console.log(typeof app);
    it("should return response code 200", (done) => {
        request("http://localhost:3030").get("/healthz").expect(200).end((err, res) => {
            if (err) return done(err);
            return done();
        });
    });
});

// describe("Create Users API", () => {
//   it("should create a new user", async () => {
//     const newUser = {
//       first_name: "testuser",
//       last_name: "testuser",
//       username: "testuser@example.com",
//       password: "password123",
//     };

//     const res = await request("http://localhost:3030")
//       .post("/user")
//       .send(newUser);

//     expect(res.statusCode).to.equal(200);
//     //expect(res.body).to.have.property("id");

//     User.findOne({
//       where: {
//         username: newUser.username,
//       },
//     }).then(user=>{
//         expect(user.username).to.equal(newUser.username);
//         expect(user.first_name).to.equal(newUser.first_name);
//     })


//   });
// });

    describe('WebApp API Test', () =>{

        //check for invalid body, fields empty
        it('If body fields are empty, it should return message with error', (done) =>{
            let body = {
                first_name: "Jai",
                last_name:  "Devmane"
            };

            chai.request("http://localhost:3030")
                .post('/v1/user')
                .send(body)
                .end((err, res) =>{
                    expect(res).to.have.status(404);
                   return done();
                })
        });
        
    });

