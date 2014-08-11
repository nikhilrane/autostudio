// var mongo = require('../util_modules/mongo');

module.exports = function(app, mongo) {

// This is a middleware that we will use on routes where
// we _require_ that a user is logged in, such as the /secret url
function requireUser(req, res, next){
  if (!req.user) {
    res.redirect('/not_allowed');
  } else {
    next();
  }
}



// This middleware checks if the user is logged in and sets
// req.user and res.locals.user appropriately if so.
function checkIfLoggedIn(req, res, next){
  if (req.session.username) {
    var coll = mongo.collection('users');
    coll.findOne({username: req.session.username}, function(err, user){
      if (user) {
        // set a 'user' property on req
        // so that the 'requireUser' middleware can check if the user is
        // logged in
        req.user = user;
        
        // Set a res.locals variable called 'user' so that it is available
        // to every handlebars template.
        res.locals.user = user;
      }
      
      next();
    });
  } else {
    next();
  }
}

// We must use this middleware _after_ the expressSession middleware,
// because checkIfLoggedIn checks the `req.session.username` value,
// which will not be available until after the session middleware runs.
app.use(checkIfLoggedIn);

app.get('/login', function(req, res){
  res.status(200).sendfile('./public/login.html');
});

app.get('/logout', function(req, res){
  delete req.session.username;
  res.redirect('/');
});

app.get('/not_allowed', function(req, res){
  res.render('not_allowed');
});

// The /secret url includes the requireUser middleware.
app.get('/secret', requireUser, function(req, res){
  res.render('secret');
});

app.get('/signup', function(req,res){
  res.status(200).sendfile('./public/signup.html');
});

function createSalt(){
  var crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
}

function createHash(string){
  var crypto = require('crypto');
  return crypto.createHash('sha256').update(string).digest('hex');
}

// This creates a new user and calls the callback with
// two arguments: err, if there was an error, and the created user
// if a new user was created.
//
// Possible errors: the passwords are not the same, and a user
// with that username already exists.
function createUser(username, password, password_confirmation, callback){
  var coll = mongo.collection('users');
  
  if (password !== password_confirmation) {
    var err = 'The passwords do not match';
    callback(err);
  } else {
    var query      = {username:username};
    var salt       = createSalt();
    var hashedPassword = createHash(password + salt);
    var userObject = {
      username: username,
      salt: salt,
      hashedPassword: hashedPassword
    };
    
    // make sure this username does not exist already
    coll.findOne(query, function(err, user){
      if (user) {
        err = 'The username you entered already exists';
        callback(err);
      } else {
        // create the new user
        coll.insert(userObject, function(err,user){
          callback(err,user);
        });
      }
    });
  }
}

app.post('/signup', function(req, res){
  // The 3 variables below all come from the form
  // in views/signup.hbs
  var username = req.body.username;
  var password = req.body.password;
  var confirm_password = req.body.confirm_password;

  createUser(username, password, confirm_password, function(err, user){
    if (err) {
      res.render('signup', {error: err});
    } else {
      
      // This way subsequent requests will know the user is logged in.
      req.session.username = user.username;
      
      res.redirect('/');  
    }
  });
});

// This finds a user matching the username and password that
// were given.
function authenticateUser(username, password, callback){
  //TODO: Put database names in config file
  var coll = mongo.collection('users');
  
  coll.findOne({username: username}, function(err, user){
    if (err) {
      return callback(err, null);
    }
    if (!user) {
      return callback(null, null);
    }
    var salt = user.salt;
    var hash = createHash(password + salt);
    if (hash === user.hashedPassword) {
      return callback(null, user);
    } else {
      return callback(null, null);
    }
  });
}

app.post('/login', function(req, res){

  //check if this is actually a signup call.
  if(req.body.submit === "Sign Up!") {
    console.log("signup called");
    res.redirect('/signup');
  }

  // These two variables come from the form on
  // the views/login.hbs page
  var username = req.body.username;
  var password = req.body.password;
  
  authenticateUser(username, password, function(err, user){
    if (user) {
      // This way subsequent requests will know the user is logged in.
      req.session.username = user.username;

      res.redirect('/home');
    } else {
      res.render('login', {badCredentials: true});
    }
  });
});



};