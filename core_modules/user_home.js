/*
 * Handles the user's home page.
 */

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

  /*
   * Send the main autostudio.html file. This call can be handled better. 
   */
  app.get('/pipestudio', requireUser, function(req, res){
    res.status(200).sendfile('./public/autostudio.html');
  });


  /*
   * TODO: Remove this repetition.
   * This is the same call as above, just serving a different App.s
   */
  app.get('/pigstudio', requireUser, function(req, res){
    res.status(200).sendfile('./public/autostudio.html');
  });


  /*
   * Send the user's home page.
   */
  app.get('/home', requireUser, function(req, res) {
    res.status(200).sendfile('./public/user_home.html');
  });


  /*
   * Sends a list of apps currently supported by AutoStudio.
   */
  app.get('/getApps', requireUser, function(req, res) {

    res.writeHeader('Content-Type', 'application/json');

    var coll = mongo.collection('apps');

    //TODO: check if we support localStorage and change columns below
    var stream = coll.find({}, {_id:0, name: 1, location: 1, key: 1, configJSON: 1}).stream();
    var jsonData = JSON.parse('{"tuples": []}');
    stream.on("data", function(item) {
      jsonData["tuples"].push(item);
    });
    
    stream.on("end", function() {
      res.end(JSON.stringify(jsonData));
    });

  });



};