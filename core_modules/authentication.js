/*
 * Define the URLs and methods for authentication purposes
 */

module.exports = function(app, mongo) {

// This is a middleware that we will use on routes where
// we _require_ that a user is logged in
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


// Returns the user's data so we can greet the client nicely!
app.get('/userData', function(req, res){
  var user = req.query.username;

  var coll = mongo.collection('users');

  // make sure this username does not exist already
  coll.findOne({username: user}, {fullName: 1, _id:0}, function(err, fullName){
    if (err) {
      throw new Error("Error while getting user's full name: " + err);
    }

    res.end(JSON.stringify(fullName));
  });
});


app.get('/logout', function(req, res){
  delete req.session.username;
  res.redirect('/');
});


app.get('/not_allowed', function(req, res){
  res.sendfile('./public/404.html');
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

/* This creates a new user and calls the callback with
 * two arguments: err, if there was an error, and the created user
 * if a new user was created.
 */
function createUser(fullName, emailAdd, username, password, password_confirmation, callback){
  var coll = mongo.collection('users');
  
  var salt = createSalt();
  var hashedPassword = createHash(password + salt);
  var userObject = {
    fullName: fullName,
    email: emailAdd,
    username: username,
    salt: salt,
    hashedPassword: hashedPassword
  };

  coll.insert(userObject, function(err,user){
    callback(err,user);
  });
    
}


app.post('/signup', function(req, res){

  var fullName = req.body.fullName;
  var emailAdd = req.body.emailID;
  var username = req.body.username;
  var password = req.body.password;
  var confirm_password = req.body.confirm_password;

  createUser(fullName, emailAdd, username, password, confirm_password, function(err, user){
    if (err) {
      res.render('signup', {error: err});
      res.end(JSON.stringify( { result: false, error: err }));
    } else {
      
      // This way subsequent requests will know the user is logged in.
      req.session.username = user.username;
      res.end(JSON.stringify( { result: true }));
    }
  });
});


/*
 * Checks if given username already exists; if yes, returns <code> true </code> otherwise <code> false </code>.
 */
app.post('/validateUserName', function(req, res) {
  var username = req.body.username;
  var coll = mongo.collection('users');

  coll.findOne({username: username}, function(err, user){
    if (user) {
      res.end(JSON.stringify( { result: true }));
    } else {
      res.end(JSON.stringify( { result: false }));
    }
  });

});



// This finds a user matching the username and password that were given
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

  var username = req.body.username;
  var password = req.body.password;
  
  authenticateUser(username, password, function(err, user){
    if (user) {
      // This way subsequent requests will know the user is logged in.
      req.session.username = user.username;
      res.end(JSON.stringify( { result: true }));

    } else {
      res.end(JSON.stringify( { result: false }));
    }
  });
});



};