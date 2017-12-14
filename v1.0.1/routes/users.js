const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/user');

//redirect user back to main if they are logged in
function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        res.redirect('/');
    } else{
        return next();
    }
}

//Register HBS rendering
router.get('/register', ensureAuthenticated, (req,res)=>{
    res.render('register');
});

//Login HBS rendering
router.get('/login', ensureAuthenticated, (req,res)=>{
    res.render('login');
});

//submitting registration form
router.post('/register', (req,res)=>{
    //console.log(req.body);
    let username = req.body.username;
    let password = req.body.password;
    let password2 = req.body.password2;

    //Validation
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    let errors = req.validationErrors();

    if (errors){
        res.render('register', {
            errors: errors
        });
    }else{
        User.getUserByUsername(username.toLowerCase(), (err, user)=>{
            if(err) throw err;
            if(user){
                req.flash('error_msg', 'That username already exist');
                
                res.redirect('/users/register');
            } else {
                let newUser = new User({
                    username: username.toLowerCase(),
                    password: password,
                    app_access: false
                })
        
                User.createUser(newUser, (err,user)=>{
                    if (err) throw err;
                    console.log(user);
                });
                req.flash('success_msg', 'You are registered and can now login');
        
                res.redirect('/users/login');
            }
        });
    }
});

//calling Local Strategy which checks the user.js in models first for username then for compare password
passport.use(new LocalStrategy(
    (username, password, done) => {
        User.getUserByUsername(username.toLowerCase(), (err, user)=>{
            if(err) throw err;
            if(!user){
                return done(null, false, {message: 'Unknown User'});
            }

            User.comparePassword(password, user.password, (err, isMatch)=>{
                if (err) throw err;
                if (isMatch){
                    console.log('Password matched! Logging In');
                    return done(null, user);
                } else{
                    console.log('Password does not matched');
                    return done(null, false, {message: 'Invalid password'});
                }
            });
        });
    }));

passport.serializeUser((user, done) => {
    done(null, user.id);
});
    
passport.deserializeUser((id, done) => {
    User.getUserById(id.toLowerCase(), (err, user) => {
        done(err, user);
    });
});

//set the scenario for different outcome
router.post('/login',
    passport.authenticate('local', {    successRedirect: '/',
                                        failureRedirect: '/users/login',
                                        failureFlash: true })
);

router.get('/logout', (req, res) => {
    req.logout();

    req.flash('success_msg', ' You are logged out');

    res.redirect('/users/login');
});

module.exports = router;