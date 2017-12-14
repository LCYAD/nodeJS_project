var app = require('http').createServer(handler);
var io = require('socket.io').listen(app);
var fs = require('fs');
var last;
var tick;
let bodyChunk;


/*
Environment           <Domain>
fxTrade               stream-fxtrade.oanda.com
fxTrade Practice      stream-fxpractice.oanda.com
sandbox               stream-sandbox.oanda.com
*/

// Replace the following variables with your personal ones
var domain = 'stream-fxpractice.oanda.com'
var access_token = 'd871c4fef9b5403a55adc22717af38e1-b34cf939aceb6b15713fd9a3f40237fc'
var account_id = '101-003-7339425-001'
// Up to 10 instruments, separated by URL-encoded comma (%2C)
var instruments = "EUR_USD%2CUSD_CAD%2CUSD_JPY"

var https;

if (domain.indexOf("stream-sandbox") > -1) {
  https = require('http');
} else {
  https = require('https');
}
var options = {
  host: domain,
  path: '/v3/accounts/' + account_id + '/pricing/stream?instruments=' + instruments,
  method: 'GET',
  headers: {"Authorization" : "Bearer " + access_token},
};

/*var request = https.request(options, function(response){
      response.on("data", function(chunk){
        //console.log('Break');
        //let temp = JSON.parse(chunk.toString());
        //let info = {'time': temp.time, };
        console.log(chunk.toString());
        if (!chunk.toString().includes("HEARTBEAT")){
          bodyChunk = chunk.toString();
        }
      });
      response.on("end", function(chunk){
         console.log("Error connecting to OANDA HTTP Rates Server");
         console.log("HTTP - " + response.statusCode);
         console.log(bodyChunk);
         process.exit(1);
      });
});*/

function requestData(socket) {
  var request = https.request(options, function(response){
    response.on("data", function(chunk){
      //console.log('Break');
      //let temp = JSON.parse(chunk.toString());
      //let info = {'time': temp.time, };
      console.log(chunk.toString());
      if (!chunk.toString().includes("HEARTBEAT")){
        bodyChunk = chunk.toString();
        socket.emit('news', bodyChunk);
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

//request.end();

app.listen(8080, 'localhost');

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }
    res.writeHead(200);
    res.end(data);
  });
};

io.sockets.on('connection', function (socket) {
  
  requestData(socket);

  /*setInterval(function(){
    if (bodyChunk !== last) {
      last = bodyChunk;
      socket.emit('news', bodyChunk);
    }
  }, 0.001);*/
  
});

