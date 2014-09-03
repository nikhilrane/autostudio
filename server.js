var express = require('express');
var app = express();
var expressSession = require('express-session');
var expressHbs = require('express3-handlebars');
var spawn = require('child_process').spawn;
var server = require('http').Server(app);
var io = require('socket.io')(server);
var cookieParser = require('cookie-parser');
var cookie = require('cookie');

// var mongoUrl = 'mongodb://localhost:27017/autostudio_db';
var MongoStore = require('connect-mongo')(expressSession);
//var mongo = require('./util_modules/mongo');

var config = require('nconf');
// We load config file blindly; its the developer's responsibility to keep it error-free!
config.file({ file : './config/config.json' });

var port = 80; // for heroku you would use process.env.PORT instead

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
var routes_user_home = require('./core_modules/user_home') (app);
var pipestudio = require('./core_modules/pipestudio') (app, mongo, io, cookie);


// io.set('authorization', function(data, accept) {
//   // console.log("in authorization with: " + JSON.stringify(data.headers.cookie));
//   if(data.headers.cookie) {
//     // console.log("in if");
//     data.cookie = cookie.parse(data.headers.cookie);
//     // console.log("assigning: " + data.cookie['connect.sid']);
//     data.sessionID = data.cookie['connect.sid'];
//   } else {
//     console.log("rejecting connection");
//     return accept("No cookie in sent.", false);
//   }

//   console.log("accepting connection with id: " + data.sessionID);

//   accept(null, true);
// });

io.use(function(socket, next){
    if (socket.request.headers.cookie) {
      // console.log("request: " + socket.request.sessionID);
      // console.log("going to next with sessionID: " + cookie.parse(socket.request.headers.cookie)['connect.sid']);
      return next();
    } 
    next(new Error('Authentication error'));
  });



//FIXME: Change this as we don't need it but some login pages depend on this!
app.engine('hbs', expressHbs({extname:'hbs', defaultLayout:'main.hbs'}));
app.set('view engine', 'hbs');

app.get('/', function(req, res){
  // var coll = mongo.collection('users');
  // coll.find({}).toArray(function(err, users){
  //   res.render('index', {users:users});  
  // })

  res.redirect('/login');
});

app.get('/spawnProc', function(req, res) {
  // var child = spawn('ping', ['google.com']);
  // child.stdout.pipe(res);
  // res.on('end', function() {
  //   console.log("killing child!");
  //   child.kill();
  // });

  res.status(200).sendfile('./public/socketTry.html');
});


io.on('connection', function(socket) {

  var sessionID = cookie.parse(socket.request.headers.cookie)['connect.sid'];
  
  //TODO Check if there is a better way, apparently the request's sessionID is gone when it reaches here from 'io.use()' call
  socket.emit("connectionMessage", "Client is connected: " + sessionID);
  socket.join(sessionID);

  socket.on('disconnect', function(){
    console.log('now disconnected!');
  });
});

app.use('/public', express.static('public'));

mongo.connect(function(){
  console.log('Connected to mongo at: ' + mongoUrl);
  server.listen(port, function(){
    console.log('Server is listening on port: '+port);
  });  
});

