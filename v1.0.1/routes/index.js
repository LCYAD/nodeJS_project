const express = require('express');
const router = express.Router();

const User = require('../models/user');

//Get Homepage
router.get('/', ensureAuthenticated, (req,res)=>{
    //console.log(req.user.instruments);
    let obj = {
        username: req.user.username,
        accountID: req.user.accountID || "",
        token: req.user.token || "",
        instruments: req.user.instruments || []
    };
    res.render('front', obj);
});

//Posting a new token to the server
router.post('/', ensureAuthenticated, (req,res)=>{

    if (req.body.token) {
        //Check if that token exist or not
        User.getUserByToken(req.body.token, (err, user)=>{
            if (err) throw err;
            if (user) {
                req.flash('error_msg', 'That token already exist');
                res.redirect('/');
            } else {
                User.changeToken(req.user.username, req.body.token, (err)=>{
                    if (err) throw err;
                });
                res.redirect('/');
            }
        });
    } else{
        res.redirect('/');
    }
    
});

//Dashboard Get
router.get('/console/dashboard', ensureAuthenticated, (req,res)=>{
    let obj = {
        username: req.user.username,
        accountID: req.user.accountID || "",
        token: req.user.token || "",
        instruments: req.user.instruments || []
    };
    res.render('dashboard', obj);
});


function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    } else{
        res.redirect('/users/login');
    }
}

module.exports = router;