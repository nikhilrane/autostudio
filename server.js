var express = require('express');
var app = express();
var expressSession = require('express-session');
var expressHbs = require('express3-handlebars');
var S = require('string')
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
      stream: process.stdout      // log INFO and above to stdout
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


// Use this so we can get access to `req.body` in our posted login
// and signup forms.
app.use( require('body-parser')() );

// We need to use cookies for sessions, so use the cookie parser middleware
app.use( require('cookie-parser')() );

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
var pipestudio = require('./core_modules/pipestudio') (app, mongo, config, S);




app.engine('hbs', expressHbs({extname:'hbs', defaultLayout:'main.hbs'}));
app.set('view engine', 'hbs');

app.get('/', function(req, res){
  // var coll = mongo.collection('users');
  // coll.find({}).toArray(function(err, users){
  //   res.render('index', {users:users});  
  // })

  res.redirect('/login');
});

app.use('/public', express.static('public'));

mongo.connect(function(){
  console.log('Connected to mongo at: ' + mongoUrl);
  app.listen(port, function(){
    console.log('Server is listening on port: '+port);
  });  
})

