const https = require('https');
let bodyChunk;
let broken_data = false;
let temp_str = "";
let temp_arr = [];
let temp_str_arr = [];

// Replace the following variables with your personal ones
const domain = 'stream-fxpractice.oanda.com';
const access_token = '4a38b827b826d678c41323a2fca74089-ae31503c37e1d9d149e4d4e42cce3bd1';
const account_id = '101-003-7339425-001';
// Up to 10 instruments, separated by URL-encoded comma (%2C)
const instruments = "EUR_ZAR%2CEUR_HUF%2CEUR_NOK%2CUSD_HUF%2CGBP_ZAR%2CNZD_SGD%2CCAD_JPY%2CEUR_USD%2CEUR_JPY%2CNZD_CHF%2CUSD_CAD%2CAUD_CAD%2CNZD_USD%2CHKD_JPY%2CCHF_JPY%2CCAD_CHF%2CCAD_SGD%2CEUR_SGD%2CEUR_TRY%2CUSD_JPY%2CCHF_HKD%2CSGD_HKD%2CGBP_HKD%2CEUR_CHF%2CEUR_SEK%2CUSD_SGD%2CGBP_PLN%2CEUR_NZD%2CNZD_JPY%2CAUD_USD%2CUSD_PLN%2CGBP_AUD%2CGBP_USD%2CUSD_MXN%2CUSD_CNH%2CTRY_JPY%2CGBP_CHF%2CUSD_THB%2CEUR_DKK%2CAUD_NZD%2CEUR_AUD%2CGBP_NZD%2CSGD_JPY%2CEUR_PLN%2CUSD_NOK%2CAUD_HKD%2CUSD_DKK%2CNZD_HKD%2CUSD_CZK%2CEUR_HKD%2CUSD_CHF%2CUSD_HKD%2CSGD_CHF%2CNZD_CAD%2CAUD_SGD%2CEUR_CZK%2CAUD_JPY%2CUSD_INR%2CCAD_HKD%2CUSD_ZAR%2CGBP_JPY%2CUSD_TRY%2CZAR_JPY%2CGBP_CAD%2CUSD_SAR%2CEUR_CAD%2CGBP_SGD%2CUSD_SEK%2CCHF_ZAR%2CEUR_GBP%2CAUD_CHF";


const options = {
    host: domain,
    path: '/v3/accounts/' + account_id + '/pricing/stream?instruments=' + instruments,
    method: 'GET',
    headers: {"Authorization" : "Bearer " + access_token},
};

// This module sets off the request from Oanda when launch
// then broadcast the data to all browser when they are connected to the socket IO
module.exports.requestData = (io)=>{
    const request = https.request(options, function(response){
        response.on("data", function(chunk){
            //console.log(chunk.toString());
            bodyChunk = chunk.toString();
            //check if the string ends with } or not
            if (!bodyChunk.includes("HEARTBEAT")){
                //check if the data starts with a { and ends with a }
                if (/}\s*$/g.test(bodyChunk) && /^\s*{/g.test(bodyChunk)){
                    //console.log(bodyChunk);
                    if ((bodyChunk.match(/instrument/g) || [] ).length == 1){
                        io.emit('tick', bodyChunk);
                    } else {
                        temp_arr = bodyChunk.split('\n');
                        for (let x = 0; x < temp_arr.length-1; x++){
                            io.emit('tick', temp_arr[x]);
                        }
                    }
                } else {
                   temp_str += bodyChunk;
                   if (/}\s*$/g.test(temp_str) && /^\s*{/g.test(temp_str)){
                       //console.log('Emitting whole JSON \n' + temp_str);
                        if ((temp_str.match(/instrument/g) || [] ).length == 1){
                            io.emit('tick', temp_str);
                        } else {
                            temp_str_arr = bodyChunk.split('\n');
                            for (let y = 0; y < temp_str_arr.length-1; y++){
                                io.emit('tick', temp_str_arr[x]);
                            }
                        }
                        temp_str = "";
                   }
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