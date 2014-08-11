//I handle Database connection and CRUD operations.

var mongoClient = require('mongodb').MongoClient;
var db;
var connected = false;

const MODULE = "db_crud_ops";
const SEP = ", ";
const CALLBACK_APPEND = "_callback";
const ENTERING = "Entering ";
const EXITING = "Exiting ";

module.exports = function(app, config, logger) {
  const DBURL = config.get('database:url') + config.get('database:host') + ":" + config.get('database:port') + "/" + config.get('database:name');

  return {

    getDBUrl: function () {
      return config.get('database:url') + config.get('database:host') + ":" + config.get('database:port') + "/" + config.get('database:name');
    },

  

  connect: function(callback) {

    const METHOD = "connect()";
    logger.debug(ENTERING + MODULE + SEP + METHOD);
    // console.log("URL: " + this.getDBUrl());

    mongoClient.connect(DBURL, function(err, _db) {

      if (err) {
        logger.error("Error occured in " + MODULE + SEP + METHOD + CALLBACK_APPEND, {error: err});
        throw new Error('Could not connect to mongodb: ' + err);
      }
      
      db = _db;
      connected = true;
      
      callback(db);
    });

    logger.debug(EXITING + MODULE + SEP + METHOD);
  },

  collection: function(name) {
    const METHOD = "collection()";
    logger.debug(ENTERING + MODULE + SEP + METHOD);

    if (!connected) {
      throw new Error('Must be connected to MongoDB before calling "collection"');
    }

    logger.debug(EXITING + MODULE + SEP + METHOD);
    
    return db.collection(name);
  },

  
  //create
  save: function(dataToSave, collectionName, callback) {

    const METHOD = "save()";
    logger.debug(ENTERING + MODULE + SEP + METHOD);

    //We expect the data to be in correct JSON format so let's just save it
    var coll = this.collection(collectionName);
    coll.insert(dataToSave, function(err, data) {
      callback(err, data);
    });

    logger.debug(EXITING + MODULE + SEP + METHOD);

  }
  

  //retrieve

  //update

  //delete

}
};