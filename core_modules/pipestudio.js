//Using nconf for consistency, else its useless here to load specific operator properties.
var pstudio_config = require('nconf');
// We load config file blindly; its the developer's responsibility to keep it error-free!
pstudio_config.file({ file : './config/pipestudio_parser_config.json' });

//Constants

const CONNECTION_KEY = "draw2d.Connection";

//Generic constants
const TRUE_KEY = "true";
const FALSE_KEY = "false";
const ROUND_OPEN_KEY = "(";
const ROUND_CLOSE_KEY = ")";
const ID_KEY = "id";
const INPUT_KEY = "_input";
const OUTPUT_KEY = "_output";
const EQUALS_KEY = " := ";
const NEW_LINE_KEY = "\n";
const BLANK_SPACE_KEY = " ";
const SEMI_COLON_KEY = ";";
const COLON_KEY = ":";
const UNDERSCORE_KEY = "_";
const COMMA_KEY = ",";

const COMMENT_KEY = "comment";
const COMMENT_START_KEY = "/*";
const COMMENT_PREFIX = "* ";
const COMMENT_END_KEY = "*/";


const PARAMETERS_KEY = "parameters";
const TYPE_KEY = "type";
const OPERATOR_KEY = "operator";
const NO_OF_INPUT_KEY = "noOfInputs";
const SOURCE_KEY = "source";
const TARGET_KEY = "target";
const NODE_KEY = "node";
const PORT_KEY = "port";

const PREFIX = "$result";
const FINAL_PREFIX = "$finalResult";

var sequence = 0;
var idNodeMaps = [];
var finalString = "";






module.exports = function(app, mongo, config, S) {

/*
 * Tasks:
 * - Remove hardcoded DB names to pick from config
 * - Move parser to a better place for genericness
 * - Check if parsing into a script is to be made async
 * - Log errors using bunyan
 */

  function processOperator(operator) {
    var currentStatement = "";
    var operatorProps = pstudio_config.get(operator[TYPE_KEY]);   //get all properties of *this* operator type

    /* constructs: <operator_id>_output = <operator> */
    currentStatement = operator[ID_KEY] + OUTPUT_KEY + EQUALS_KEY + operatorProps[OPERATOR_KEY];

    //if this operator has an input, put dummy values to process during connection processing
    var noOfInputs = operatorProps[NO_OF_INPUT_KEY];

    if( noOfInputs == 0) {    //if no inputs, just append () to operator. For instance, file_source()
      
      /* <operator_id>_output = <operator>() */
      currentStatement = currentStatement + ROUND_OPEN_KEY + ROUND_CLOSE_KEY;
      
    } else {      //loop through number of inputs and append dummy strings

      /* constructs something like: <operator_id>_output = <operator>(<operator_id>_input0, <operator_id>_input1, ... ) */
          
          currentStatement = currentStatement + ROUND_OPEN_KEY;
          
          for(var ip = 0; ip < noOfInputs; ip++)
          {
            currentStatement = currentStatement + operator[ID_KEY] + INPUT_KEY + ip;
            
            if(ip < noOfInputs - 1)   //avoid last ',' if this is the last input
            {
              currentStatement = currentStatement + COMMA_KEY;
            }
          }
          
          currentStatement = currentStatement + ROUND_CLOSE_KEY;
    }
    currentStatement = currentStatement + NEW_LINE_KEY;

    //append parameters
    var params = operator[PARAMETERS_KEY];

    // console.log("keys: " + Object.keys(params[0]));

    //Here, each paramater is going to be an Object. Let's parse into JSONObject and get corresponding value.
    for(var j = 0; j < params.length; j++) {

      var currentParam = params[j];
      var key = Object.keys(currentParam);    //TODO: key is actually surrounded by []. Check if this occurs in the parsed script too!
      var value = S(currentParam[key]).trim().s;

      if( S(key).contains(COMMENT_KEY) ) {      //if this is a comment, we enclose it within /* ... */

        currentStatement = COMMENT_START_KEY + value + COMMENT_END_KEY + NEW_LINE_KEY + currentStatement + NEW_LINE_KEY;

      } else {

        //put the value in () brackets if not already inside one
        if( S(value).trim().length > 0 && !S(value).startsWith(ROUND_OPEN_KEY) ) {
          value = ROUND_OPEN_KEY + value;

          //we assume that closing bracket is also missing and blindly append it; else parsing it will be complex.
          value = value + ROUND_CLOSE_KEY;
        }

        key = S(key).replaceAll("Parameter", "").s;
        currentStatement = currentStatement + key + BLANK_SPACE_KEY + value;


        //if this is the last parameter, append a ';' otherwise append a new line character 
        if(j == params.length-2) {    //here it is '-2' because there is one "comment" parameter too
          currentStatement = currentStatement + SEMI_COLON_KEY;
        } else {
          currentStatement = currentStatement + NEW_LINE_KEY;
        }
      }

    }

    var operatorID = operator[ID_KEY];
    idNodeMaps[operatorID] = currentStatement;
  }


 function processConnection(connection) {
    var sourceID = connection[SOURCE_KEY][NODE_KEY];
    var sourcePort = connection[SOURCE_KEY][PORT_KEY];
    var targetID = connection[TARGET_KEY][NODE_KEY];
    var targetPort = connection[TARGET_KEY][PORT_KEY];
    // console.log("INfo: " + sourceID + ", " + sourcePort + ", " + targetID + ", " + targetPort);

    var sourceStatement = idNodeMaps[sourceID];
    var targetStatement = idNodeMaps[targetID];

    // console.log("source: " + sourceStatement + ", target: " + targetStatement);

    // String sourceStatement = idNodeMapping.get(sourceID);
    // String targetStatement = idNodeMapping.get(targetID);

    sourceStatement = S(sourceStatement).replaceAll(sourceID + OUTPUT_KEY, PREFIX + sequence).s;
    targetStatement = S(targetStatement).replaceAll(targetID + UNDERSCORE_KEY + targetPort, PREFIX + sequence).s;

    sequence++;

    //Update our Map to latest statement
    idNodeMaps[sourceID] = sourceStatement;
    idNodeMaps[targetID] = targetStatement;

    /*
    //  * Known problem here: When using an operator which needs an input, e.g. Project, and there is none in pstudio data, then that statement will not be considered here due to 'if'
    //  */
    if( !S(sourceStatement).contains(sourceID))   //this means every variable is processed
    {
      finalString = finalString + NEW_LINE_KEY + sourceStatement + NEW_LINE_KEY;
    }

    // console.log("\n\nsource: " + sourceStatement + "\ntarget: " + targetStatement);

 }

app.get('/pipestudio/getList', function(req, res) {

  //we can get username from both ways (in request set by express-session or request data)
  var user = req.query.username;
  // console.log("user: " + user);

  res.writeHeader('Content-Type', 'application/json');

  //get all document names for this user
  var coll = mongo.collection('pstudio');

  //TODO: check if we support localStorage and change columns below
  // coll.findOne({ username : user }, {"name":1, _id:0}, function(err, jsonData) {
  //   if(err) { throw new Error("Error while saving: " + err + ", data: " + jsonData); }

  //   console.log("Sending: " + JSON.stringify( { result: jsonData }));
  //   res.end(JSON.stringify( { result: jsonData }));
  // });

  var stream = coll.find({ username : user }, {"name":1, _id:0}).stream();
  var jsonData = JSON.parse('{"result": []}');
  stream.on("data", function(item) {
    jsonData["result"].push(item);
    // console.log("data: " + JSON.stringify(jsonData));
  });
  
  stream.on("end", function() {
    // var result = {result: JSON.parse(jsonData)};
    // console.log("final: " + JSON.stringify(jsonData));
    res.end(JSON.stringify(jsonData));
  });

});


app.get('/pipestudio/getDoc', function(req, res) {

  //we can get username from both ways (in request set by express-session or request data)
  var docName = req.query.documentName;
  var user = req.query.username;
  
  // console.log("doc: " + docName);

  res.writeHeader('Content-Type', 'application/json');

  //get all document names for this user
  var coll = mongo.collection('pstudio');

  //TODO: check if we support localStorage and change columns below
  // coll.findOne({ username : user }, {"name":1, _id:0}, function(err, jsonData) {
  //   if(err) { throw new Error("Error while saving: " + err + ", data: " + jsonData); }

  //   console.log("Sending: " + JSON.stringify( { result: jsonData }));
  //   res.end(JSON.stringify( { result: jsonData }));
  // });

  coll.findOne({name: docName, username : user}, {"documentData":1, "name":1, _id:0}, function(err, jsonData) {
    if(err) { throw new Error("Error while getting: " + err + ", data: " + jsonData); }

    // console.log("Sending this: " + JSON.stringify({result: jsonData}));

    res.end(JSON.stringify( { result: jsonData }));
  });


});


app.post('/pipestudio/save', function(req, res) {

  var jsonData = req.body.toStore;

  res.writeHeader('Content-Type', 'application/json');
  
  mongo.save(jsonData, 'pstudio', function(err) {
    if(err) { throw new Error("Error while saving: " + err); }

    res.end(JSON.stringify({result: true}));
  });

});

//TODO: Check if we can replace this call by the '/getDoc' call.
//This one is used in user_home.html
app.post('/pipestudio/get', function(req, res) {

  var fileName = req.body.name;

  res.writeHeader('Content-Type', 'application/json');

  var coll = mongo.collection('pstudio');
  coll.findOne({name: fileName}, {"documentData":1, "name":1, _id:0}, function(err, jsonData) {
    if(err) { throw new Error("Error while getting: " + err + ", data: " + jsonData); }

    // console.log("Sending this: " + JSON.stringify({result: jsonData}));

    res.end(JSON.stringify( { result: jsonData }));
  });

});





app.post('/pipestudio/generateScript', function(req, res) {

  var parsedData = JSON.parse(JSON.stringify(req.body.toGenerate.documentData));
  var fileName = req.body.toGenerate.name;
  var user = req.body.toGenerate.username;
  // console.log("parsed: " + JSON.stringify(parsedData) + "\n\n");

  //TODO: put this call to be performed asynchronously
  parsedData.forEach(function(element, index) {

    if(!S(element[TYPE_KEY]).contains(CONNECTION_KEY)) {       //if not a connection
      processOperator(element);
    } else {
      processConnection(element);
    }

});

  //Process the last connection again as the final output is still to be replaced with correct container.
  lastConnection = parsedData[parsedData.length-1];   //get the last connection

  var targetID = lastConnection[TARGET_KEY][NODE_KEY];
  var targetStatement = idNodeMaps[targetID];

  if( S(targetStatement).contains(targetID) ) {
    targetStatement = S(targetStatement).replaceAll(targetID + OUTPUT_KEY, FINAL_PREFIX).s;
    idNodeMaps[targetID] = targetStatement;

    finalString = finalString + NEW_LINE_KEY + targetStatement + NEW_LINE_KEY;
  }

  // console.log("Final String: " + NEW_LINE_KEY + finalString);

  // res.writeHeader('Content-Type', 'application/json');

  var coll = mongo.collection('pstudio');
  coll.update({name: fileName, username : user}, {$set:{script: finalString}}, function(err) {
    if(err) { throw new Error("Error while saving: " + err); }

    res.end(JSON.stringify({result: true}));
  });


});



};