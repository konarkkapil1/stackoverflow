const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const passport = require('passport')
const { secret } = require('../../setup/myurl')

//schema for user registration
const Person = require('../../models/Person')

//TYPE      POST
//ROUTE     /API/AUTH/LOGIN
//DESC      LOGIN ROUTE
//ACCESS    PUBLIC
router.post('/login',(req,res)=>{
    const { email ,password } = req.body;
    Person.findOne({email})
    .then(person => {
        if(person){
            if(person.blocked){
                res.json({error: 'your account has been blocked'});
            }
            const profile = {
                email: person.email,
                gender: person.gender,
                name: person.name,
                profilePic: person.profilePic
            }
            bcrypt.compare(password,person.password)
            .then(isCorrect => {
                if(isCorrect){
                    const payload = {
                        id: person.id,
                        name: person.name,
                        email: person.email
                    };
                    jwt.sign(payload,secret,{expiresIn: 3600},(error,token)=>{
                        res.json({
                            success: true,
                            token: "Bearer " + token,
                            profile
                        })
                    })
                }else{
                    res.json({error: "invalid credentials! try again"})
                }
            })
            .catch(error => console.log(error))
        }else{
            res.json({error: 'no user found'})
        }
        
    })
    .catch(error => res.json({error: 'unable to login at the moment! please try again'}))
})

//TYPE      POST
//ROUTE     /API/AUTH/REGISTER
//DESC      REGISTRATION ROUTE
//ACCESS    PUBLIC
router.post('/register',(req,res)=>{
    Person.findOne({email: req.body.email})
    .then((person) => {
        if(person){
            res.status(400).json({error: 'That email is already taken! please try another one'})
        }else{
            const newPerson = new Person({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                gender: req.body.gender
            })
            //hashing password 
            bcrypt.genSalt(10, (err, salt)=> {
                bcrypt.hash(newPerson.password, salt, (err, hash)=> {
                    // Store hash in your password DB.
                    if(err => console.log(err));
                    newPerson.password = hash;
                    newPerson.save()
                    .then(person => res.json(person))
                    .catch(error => res.json({error: 'unable to create a account try again' + error}))
                });
            });

        }
    })
    .catch(error => console.log(error))
})

//TYPE      GET
//ROUTE     /API/AUTH/PROFILE
//DESC      ROUTER FOR USER PROFILE
//ACCESS    PRIVATE
router.get('/profile',passport.authenticate('jwt',{session:false}), (req,res)=>{
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        profilePic: req.user.profilePic
    })
})

module.exports = router;