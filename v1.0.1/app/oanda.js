const https = require('https');
let bodyChunk;

// Replace the following variables with your personal ones
const domain = 'stream-fxpractice.oanda.com';
const access_token = 'd871c4fef9b5403a55adc22717af38e1-b34cf939aceb6b15713fd9a3f40237fc';
const account_id = '101-003-7339425-001';
// Up to 10 instruments, separated by URL-encoded comma (%2C)
const instruments = "EUR_USD%2CUSD_JPY";


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
            if (!chunk.toString().includes("HEARTBEAT")){
                bodyChunk = chunk.toString();
                io.emit('tick', bodyChunk);
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