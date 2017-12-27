const https = require('https');
let bodyChunk;
let broken_data = false;
let temp_str = "";
let temp_arr = [];
let temp_str_arr = [];
const sio = require('./sio.js');

// Replace the following variables with your personal ones
const domain = "stream-fxpractice.oanda.com";
const access_token = "4a38b827b826d678c41323a2fca74089-ae31503c37e1d9d149e4d4e42cce3bd1";
const account_id = "101-003-7339425-001";
// Up to 10 instruments, separated by URL-encoded comma (%2C)

//Backup access_token & account ID
//const access_token = "7244eeac343920574e1933d6b255b78d-68336798406e242f637742f580fcf7bd";
//const account_id = "101-003-7340825-001";

//Test Instrument
const instruments = "EUR_USD%2CUSD_JPY%2CUSD_CAD%2CGBP_USD%2CEUR_GBP";

//Forex Instrument
//const instruments = "EUR_ZAR%2CEUR_HUF%2CEUR_NOK%2CUSD_HUF%2CGBP_ZAR%2CNZD_SGD%2CCAD_JPY%2CEUR_USD%2CEUR_JPY%2CNZD_CHF%2CUSD_CAD%2CAUD_CAD%2CNZD_USD%2CHKD_JPY%2CCHF_JPY%2CCAD_CHF%2CCAD_SGD%2CEUR_SGD%2CEUR_TRY%2CUSD_JPY%2CCHF_HKD%2CSGD_HKD%2CGBP_HKD%2CEUR_CHF%2CEUR_SEK%2CUSD_SGD%2CGBP_PLN%2CEUR_NZD%2CNZD_JPY%2CAUD_USD%2CUSD_PLN%2CGBP_AUD%2CGBP_USD%2CUSD_MXN%2CUSD_CNH%2CTRY_JPY%2CGBP_CHF%2CUSD_THB%2CEUR_DKK%2CAUD_NZD%2CEUR_AUD%2CGBP_NZD%2CSGD_JPY%2CEUR_PLN%2CUSD_NOK%2CAUD_HKD%2CUSD_DKK%2CNZD_HKD%2CUSD_CZK%2CEUR_HKD%2CUSD_CHF%2CUSD_HKD%2CSGD_CHF%2CNZD_CAD%2CAUD_SGD%2CEUR_CZK%2CAUD_JPY%2CUSD_INR%2CCAD_HKD%2CUSD_ZAR%2CGBP_JPY%2CUSD_TRY%2CZAR_JPY%2CGBP_CAD%2CUSD_SAR%2CEUR_CAD%2CGBP_SGD%2CUSD_SEK%2CCHF_ZAR%2CEUR_GBP%2CAUD_CHF";

//All instruments
//const instruments ="EUR_ZAR%2CEUR_HUF%2CEUR_NOK%2CUSD_HUF%2CGBP_ZAR%2CNZD_SGD%2CCAD_JPY%2CEUR_USD%2CEUR_JPY%2CNZD_CHF%2CUSD_CAD%2CAUD_CAD%2CNZD_USD%2CHKD_JPY%2CCHF_JPY%2CCAD_CHF%2CCAD_SGD%2CEUR_SGD%2CEUR_TRY%2CUSD_JPY%2CCHF_HKD%2CSGD_HKD%2CGBP_HKD%2CEUR_CHF%2CEUR_SEK%2CUSD_SGD%2CGBP_PLN%2CEUR_NZD%2CNZD_JPY%2CAUD_USD%2CUSD_PLN%2CGBP_AUD%2CGBP_USD%2CUSD_MXN%2CUSD_CNH%2CTRY_JPY%2CGBP_CHF%2CUSD_THB%2CEUR_DKK%2CAUD_NZD%2CEUR_AUD%2CGBP_NZD%2CSGD_JPY%2CEUR_PLN%2CUSD_NOK%2CAUD_HKD%2CUSD_DKK%2CNZD_HKD%2CUSD_CZK%2CEUR_HKD%2CUSD_CHF%2CUSD_HKD%2CSGD_CHF%2CNZD_CAD%2CAUD_SGD%2CEUR_CZK%2CAUD_JPY%2CUSD_INR%2CCAD_HKD%2CUSD_ZAR%2CGBP_JPY%2CUSD_TRY%2CZAR_JPY%2CGBP_CAD%2CUSD_SAR%2CEUR_CAD%2CGBP_SGD%2CUSD_SEK%2CCHF_ZAR%2CEUR_GBP%2CAUD_CHF%2CXCU_USD%2CXAG_GBP%2CXAG_HKD%2CXAU_HKD%2CXAU_CAD%2CXAU_SGD%2CXAU_AUD%2CXAG_CAD%2CXAU_CHF%2CXAU_NZD%2CXPD_USD%2CXPT_USD%2CXAG_NZD%2CXAG_JPY%2CXAU_EUR%2CXAG_CHF%2CXAU_XAG%2CXAG_USD%2CXAG_EUR%2CXAU_JPY%2CXAG_AUD%2CXAU_GBP%2CXAU_USD%2CXAG_SGD%2CBCO_USD%2CWTICO_USD%2CNATGAS_USD%2CSUGAR_USD%2CSOYBN_USD%2CCORN_USD%2CWHEAT_USD%2CDE30_EUR%2CNAS100_USD%2CNL25_EUR%2CSG30_SGD%2CUK100_GBP%2CAU200_AUD%2CIN50_USD%2CJP225_USD%2CFR40_EUR%2CEU50_EUR%2CSPX500_USD%2CUS30_USD%2CTWIX_USD%2CCN50_USD%2CHK33_HKD%2CUS2000_USD%2CDE10YB_EUR%2CUSB10Y_USD%2CUSB30Y_USD%2CUK10YB_GBP%2CUSB05Y_USD%2CUSB02Y_USD";

const options = {
    host: domain,
    path: '/v3/accounts/' + account_id + '/pricing/stream?instruments=' + instruments,
    method: 'GET',
    headers: {"Authorization" : "Bearer " + access_token},
};

// This module sets off the request from Oanda when launch
// then broadcast the data to all browser when they are connected to the socket IO
module.exports.requestData = ()=>{
    const request = https.request(options, function(response){
        response.on("data", function(chunk){

            bodyChunk = chunk.toString();
            //console.log(bodyChunk);

            //check if the data starts with a { and ends with a }
            if (/}\s*$/g.test(bodyChunk) && /^\s*{/g.test(bodyChunk)){
                //console.log(bodyChunk);
                if ((bodyChunk.match(/instrument/g) || [] ).length == 1){
                    sio.emitTick(bodyChunk);
                } else {
                    temp_arr = bodyChunk.split('\n');
                    for (let x = 0; x < temp_arr.length-1; x++){
                        sio.emitTick(temp_arr[x]);
                    }
                }
            } else {
                temp_str += bodyChunk;
                if (/}\s*$/g.test(temp_str) && /^\s*{/g.test(temp_str)){
                    //console.log('Emitting whole JSON \n' + temp_str);
                    if ((temp_str.match(/instrument/g) || [] ).length == 1){
                        sio.emitTick(temp_str);
                    } else {
                        temp_str_arr = bodyChunk.split('\n');
                        for (let y = 0; y < temp_str_arr.length-1; y++){
                            sio.emitTick(temp_str_arr[y]);
                        }
                    }
                    temp_str = "";
                }
            }

        });
        response.on("end", function(chunk){
            console.log("Error connecting to OANDA HTTP Rates Server");
            console.log("HTTP - " + response.statusCode);
            console.log(bodyChunk);
            process.exit(1);
        });
    });

    request.end();
}
