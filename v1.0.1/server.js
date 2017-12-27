const express  = require('express');
const path     = require('path');
const app      = express();
const http     = require('http').Server(app);
const https    = require('https');
const io       = require('socket.io')(http);
const port     = process.env.PORT || 8080;
const passport = require('passport');
const flash    = require('connect-flash');
const hbs      = require('express-handlebars');
const cookieParser = require('cookie-parser');
const bodyParser   = require('body-parser');
const session      = require('express-session');
const expressValidator = require('express-validator');
const passportOneSessionPerUser = require('passport-one-session-per-user');
const cors = require('cors');

// Mongo DB
const mongo = require('mongodb');
const mongoose = require('mongoose');

//connect mongoose
const db = mongoose.connect('mongodb://localhost/stockapp', {
    useMongoClient: true,
    /*other option*/
});

// socket IO ======================================================================
require('./app/sio.js').receiveIO(io); // passing io sockets to module

// Oanda API ======================================================================
const oanda = require('./app/oanda.js');
oanda.requestData();

// set up our express application
app.use(cookieParser()); // read cookies (needed for auth)
app.use(cors());
app.options('*', cors());

//BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', hbs({defaultLayout: 'layout'}));
app.set('view engine', 'handlebars');

//Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// required for passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

//Express Validator
app.use(expressValidator({
    errorFormatter: function(param, msg, value){
        let namespace = param.split('.')
        ,   root    = namespace.shift()
        ,   formParam = root;
        
        while(namespace.length){
            formParam += '[' + namespace.shift() + ']';
        }
        return{
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

// one session per user
passport.use(new passportOneSessionPerUser());
app.use(passport.authenticate('passport-one-session-per-user'));

app.use(flash()); // use connect-flash for flash messages stored in session

//Global variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

// routes ========================================================================
const routes = require('./routes/index');
const users = require('./routes/users');
app.use('/', routes);
app.use('/users',users);

// launch ======================================================================
http.listen(port);
console.log('The server has connected to ' + port);