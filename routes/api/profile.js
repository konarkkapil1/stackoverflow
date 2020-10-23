const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

//person model
const Person = require('../../models/Person')
//profile model
const Profile = require('../../models/Profile.js');

//TYPE      GET
//ROUTE     /API/PROFILE/
//DESC      ROUTE FOR PERSONAL USER PROFILE
//ACCESS    PRIVATE
router.get('/', passport.authenticate('jwt',{session:false}),(req,res)=>{
    Profile.findOne({user: req.user.id})
    .then(profile=>{
        if(!profile){
            res.json({error: 'user profile not found'});
        }else{
            res.json(profile);
        }
    })
    .catch(error => res.json({error: 'cannot load profile'}))
});

//TYPE      POST
//ROUTE     /API/PROFILE/
//DESC      ROUTE FOR UPDATING PERSONAL USER PROFILE
//ACCESS    PRIVATE
router.post('/', passport.authenticate('jwt',{session:false}), (req,res)=>{
    const profileValues = {};
    profileValues.user = req.user.id;
    if(req.body.username) profileValues.username = req.body.username;
    if(req.body.website) profileValues.website = req.body.website;
    if(req.body.country) profileValues.country = req.body.country;
    if(req.body.portfolio) profileValues.portfolio = req.body.portfolio;
    if(typeof req.body.languages !== undefined){
        profileValues.languages = req.body.languages.split(',');
    }
    //get social links
    profileValues.social = {};
    if(req.body.youtube) profileValues.social.youtube = req.body.youtube;
    if(req.body.facebook) profileValues.social.facebook = req.body.facebook;
    if(req.body.instagram) profileValues.social.instagram = req.body.instagram;
    
    //database calls
    Profile.findOne({user: req.user.id})
    .then(profile => {
        // res.json(profile)
        if(profile){
            Profile.findOneAndUpdate({user: req.user.id},{$set: profileValues},{new: true})
            .then(profile=>{
                res.json(profile);
            })
            .catch(error => res.status(400).json({error: 'cannot update profile'}));
        }else{
            Profile.findOne({username: profileValues.username})
            .then(profile=>{
                if(profile){
                    res.status(400).json({error: 'username already exists'});
                }else{
                    new Profile(profileValues).save()
                    .then(savedProfile=>{
                        res.json(savedProfile);
                    })
                    .catch(error => res.json({error: 'unable to save profile'}));
                }
            })
            .catch(error => res.status(400).json({error: 'cannot update profile'}));
        }
    })
    .catch(error => res.status(400).json({error: 'cannot load profile'}));
})

//TYPE      GET
//ROUTE     /API/PROFILE/:USERNAME
//DESC      ROUTE FOR FETCHING USER PROFILE BASED ON USERNAME
//ACCESS    PUBLIC
router.get('/:username',(req,res)=>{
    Profile.findOne({username: req.params.username})
    .populate('user',['name','profilePic'])
    .then(profile => {
        if(!profile){
            res.status(400).json({error: 'no profile found'})
        }
        res.json(profile)
    })
    .catch(error => res.status(400).json({error: 'error in fetching profile'}))
})

//TYPE      GET
//ROUTE     /API/PROFILE/FIND/EVERYONE
//DESC      ROUTE FOR FETCHING EVERYUSER PROFILE
//ACCESS    PUBLIC
router.get('/find/everyone',(req,res)=>{
    Profile.findOne()
    .populate('user',['name','profilePic'])
    .then(profiles => {
        if(!profiles){
            res.status(400).json({error: 'no profile found'})
        }
        res.json(profiles)
    })
    .catch(error => res.status(400).json({error: 'error in fetching profile'}))
})

//TYPE      DELETE
//ROUTE     /API/PROFILE/
//DESC      ROUTE FOR DELETING A USER PROFILE
//ACCESS    PRIVATE
router.delete('/', passport.authenticate('jwt',{session:false}), (req,res) => {
    Profile.findOne({user: req.user.id})
    Profile.findOneAndRemove({user: req.user.id})
    .then(() => {
        Person.findOneAndRemove({_id: req.user.id})
        .then(() => {
            res.json({success: 'profile deleted successfully'})
        })
        .catch(error => res.json({error: 'unable to delete user'}))
    })
    .catch(error => res.json({error: 'unable to delete user profile'}))
})

module.exports = router;