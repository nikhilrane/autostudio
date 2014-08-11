//var mongo = require('../util_modules/mongo');

module.exports = function(app) {

// This is a middleware that we will use on routes where
// we _require_ that a user is logged in, such as the /secret url
function requireUser(req, res, next){
  if (!req.user) {
    res.redirect('/not_allowed');
  } else {
    next();
  }
}

//TODO: Remove this if required
app.get('/pipestudio', requireUser, function(req, res){
  res.status(200).sendfile('./public/pipestudio.html');
});


app.get('/home', requireUser, function(req, res) {
  res.status(200).sendfile('./public/user_home.html');
});



};