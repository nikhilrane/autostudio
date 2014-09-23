/*
 * The main server file for AppStudio.
 * Creates module variables and passes them to other modules which need it.
 */
var express = require('express');
var app = express();
var expressSession = require('express-session');
var expressHbs = require('express3-handlebars');
var spawn = require('child_process').spawn;
var server = require('http').Server(app);
var io = require('socket.io')(server);
var cookieParser = require('cookie-parser');
var cookie = require('cookie');
var nodemailer = require('nodemailer');


var MongoStore = require('connect-mongo')(expressSession);

var config = require('nconf');
// We load config file blindly; its the developer's responsibility to keep it error-free!
config.file({ file : './config/config.json' });

var port = 80; // by default AutoStudio listens on Port 80

// Initialize our mailer module with our email id and password
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'autostudio.mailer@gmail.com',
        pass: 'ASMailer'
    }
});

// Get MongoDB config and generate database URL
var mongoUrl = config.get('database:url') + config.get('database:host') + ":" + config.get('database:port') + "/" + config.get('database:name');

//TODO: Pick this from config file once this snippet works
var logger = require('bunyan').createLogger({
  name: 'autostudio',
  streams: [
    {
      level: 'info',
      path: './logs/info.log'      // log INFO and above to stdout
    },
    {
      level: 'error',
      path: './logs/error.log'    // log ERROR and above to a file
    },
    {
      level: 'debug',
      path: './logs/debug.log'    // log ERROR and above to a file
    }
  ]
});


// Use this so we can get access to `req.body`
app.use( require('body-parser')() );

// We need to use cookies for sessions, so use the cookie parser middleware
app.use( cookieParser() );

app.use( expressSession({
  secret: 'somesecretrandomstring',
  store: new MongoStore({
    url: mongoUrl
  })
}));


//TODO: (remove me) calling this here because we need to setup expressSession and cookie-parses modules first
//Initialize our core modules
var mongo = require('./core_modules/db_crud_ops') (app, config, logger);
var routes_auth = require('./core_modules/authentication') (app, mongo);
var routes_user_home = require('./core_modules/user_home') (app, mongo);
var pipestudio = require('./core_modules/pipestudio') (app, mongo, io, cookie, transporter);


// Initialize the socket.io library once here so we can just reuse it later
io.use(function(socket, next){
    if (socket.request.headers.cookie) {
      return next();
    } 
    next(new Error('Authentication error'));
  });

io.on('connection', function(socket) {

  var sessionID = cookie.parse(socket.request.headers.cookie)['connect.sid'];
  
  // Join the session so that when the user opens multiple sessions, we can make sure messages are delivered correctly
  socket.join(sessionID);

  socket.on('disconnect', function(){
    //TODO: Do something here if needed
  });
});


//FIXME: Change this to support in a better way!
app.engine('hbs', expressHbs({extname:'hbs', defaultLayout:'main.hbs'}));
app.set('view engine', 'hbs');

app.get('/', function(req, res){
  res.redirect('/login');
});


/*
 * Send the 'about' page.
 */
app.get('/about', function(req, res) {
  res.status(200).sendfile('./public/about.html');
});


/*
 * Send the 'contact' page.
 */
app.get('/contact', function(req, res) {
  res.status(200).sendfile('./public/contact.html');
});


// Initialize the public directory for exposing client side
app.use('/public', express.static('public'));

// Connect MongoDB and start the web server
mongo.connect(function(){
  console.log('Connected to mongo at: ' + mongoUrl);
  server.listen(port, function(){
    console.log('Server is listening on port: '+port);
  });  
});

