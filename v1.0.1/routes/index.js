const express = require('express');
const router = express.Router();

const User = require('../models/user');

const allInstrument = [ 
    'EUR_ZAR','EUR_HUF','EUR_NOK','USD_HUF','GBP_ZAR','NZD_SGD','CAD_JPY',
    'EUR_USD','EUR_JPY','NZD_CHF','USD_CAD','AUD_CAD','NZD_USD','HKD_JPY',
    'CHF_JPY','CAD_CHF','CAD_SGD','EUR_SGD','EUR_TRY','USD_JPY','CHF_HKD',
    'SGD_HKD','GBP_HKD','EUR_CHF','EUR_SEK','USD_SGD','GBP_PLN','EUR_NZD',
    'NZD_JPY','AUD_USD','USD_PLN','GBP_AUD','GBP_USD','USD_MXN','USD_CNH',
    'TRY_JPY','GBP_CHF','USD_THB','EUR_DKK','AUD_NZD','EUR_AUD','GBP_NZD',
    'SGD_JPY','EUR_PLN','USD_NOK','AUD_HKD','USD_DKK','NZD_HKD','USD_CZK',
    'EUR_HKD','USD_CHF','USD_HKD','SGD_CHF','NZD_CAD','AUD_SGD','EUR_CZK',
    'AUD_JPY','USD_INR','CAD_HKD','USD_ZAR','GBP_JPY','USD_TRY','ZAR_JPY',
    'GBP_CAD','USD_SAR','EUR_CAD','GBP_SGD','USD_SEK','CHF_ZAR','EUR_GBP',
    'AUD_CHF','XCU_USD','XAG_GBP','XAG_HKD','XAU_HKD','XAU_CAD','XAU_SGD',
    'XAU_AUD','XAG_CAD','XAU_CHF','XAU_NZD','XPD_USD','XPT_USD','XAG_NZD',
    'XAG_JPY','XAU_EUR','XAG_CHF','XAU_XAG','XAG_USD','XAG_EUR','XAU_JPY',
    'XAG_AUD','XAU_GBP','XAU_USD','XAG_SGD','BCO_USD','WTICO_USD','NATGAS_USD',
    'SUGAR_USD','SOYBN_USD','CORN_USD','WHEAT_USD','DE30_EUR','NAS100_USD',
    'NL25_EUR','SG30_SGD','UK100_GBP','AU200_AUD','IN50_USD','JP225_USD','FR40_EUR',
    'EU50_EUR','SPX500_USD','US30_USD','TWIX_USD','CN50_USD','HK33_HKD',
    'US2000_USD','DE10YB_EUR','USB10Y_USD','USB30Y_USD','UK10YB_GBP',
    'USB05Y_USD','USB02Y_USD']

function getOtherInstruments(instruments){
    return allInstrument.filter((item)=>{
        return !(item in instruments);
    })
}

//Get Homepage
router.get('/', ensureAuthenticated, (req,res)=>{
    let other_instruments = getOtherInstruments(req.user.instruments);
    let obj = {
        username: req.user.username,
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
    let other_instruments = getOtherInstruments(req.user.instruments);
    let obj = {
        username: req.user.username,
        token: req.user.token || "",
        instruments: req.user.instruments || [],
        other_instruments: other_instruments || []
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