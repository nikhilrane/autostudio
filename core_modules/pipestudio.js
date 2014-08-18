//Using nconf for consistency, else its useless here to load specific operator properties.
var pstudio_config = require('nconf');
var S = require('string');
var spawn = require('child_process').spawn;

// We load config file blindly; its the developer's responsibility to keep it error-free!
pstudio_config.file({ file : './config/pipestudio_parser_config.json' });

//Constants

const DEFINE_KEY = "define ";

//Generic constants
const TRUE_KEY = "true";
const FALSE_KEY = "false";
const ROUND_OPEN_KEY = "(";
const ROUND_CLOSE_KEY = ")";
const BRACE_OPEN_KEY = "{";
const BRACE_CLOSE_KEY = "}";
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
const COMMENT_START_KEY = "/*\n";
const COMMENT_PREFIX = "* ";
const COMMENT_END_KEY = "\n*/";


const PARAMETERS_KEY = "parameters";
const TYPE_KEY = "type";
const OPERATOR_KEY = "operator";
const CONNECTION_KEY = "connection";
const CONTAINER_KEY = "container";
const NO_OF_INPUT_KEY = "noOfInputs";
const SOURCE_KEY = "source";
const TARGET_KEY = "target";
const NODE_KEY = "node";
const PORT_KEY = "port";
const RETURNS_KEY = " returns ";

const MACRO_INPUT_PREFIX = "$in";
const MACRO_OUTPUT_PREFIX = "$out";
const INPUT_PREFIX = "$input";
const OUTPUT_PREFIX = "$result";
const FINAL_PREFIX = "$finalResult";

// var input_sequence = 0;
// var output_sequence = 0;
// var processedOperators = {};
// var finalString = "";
// var finalResult = [];
// var finalResultIndex = 0;


module.exports = function(app, mongo) {

/*
 * Tasks:
 * - Remove hardcoded DB names to pick from config
 * - Move parser to a better place for genericness
 * - Check if parsing into a script is to be made async
 * - Log errors using bunyan
 */
    function saveScriptToDB(generatedScript, fileName, user) {
        var coll = mongo.collection('pstudio');
        coll.update({name: fileName, username : user}, {$set:{script: generatedScript}}, function(err) {
          if(err) { throw new Error("Error while saving: " + err); }

          // res.end(JSON.stringify({result: true}));

          console.log("Script saved!");
        });
    }



  function processOperator(operator, statusVariables, finalResult) {
    var currentStatement = "";
    var operatorProps = pstudio_config.get(operator[TYPE_KEY]);   //get all properties of *this* operator type

    if(operator.type === "example.shape.Use_Predefined") {
      /* constructs: <operator_id>_output = macro_name */
      currentStatement = operator[ID_KEY] + OUTPUT_KEY + EQUALS_KEY + operator.label;
    } else if(operator.type === "example.shape.User_Defined") {
      currentStatement = DEFINE_KEY + operator.label;
    } else {
      /* constructs: <operator_id>_output = <operator> */
      currentStatement = operator[ID_KEY] + OUTPUT_KEY + EQUALS_KEY + operatorProps[OPERATOR_KEY];
    }

    //if this operator has an input, put dummy values to process during connection processing
    var noOfInputs = operatorProps[NO_OF_INPUT_KEY];

    if( noOfInputs === 0) {    //if no inputs, just append () to operator. For instance, file_source()
      
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

    //append parameters
    var params = operator.userData[PARAMETERS_KEY];

    // if(params !== undefined && params.length > 0)
    //   console.log("params length: " + params.length);
    // else
    //   console.log("params undefined");

    if(params !== undefined && params.length > 0) {

      currentStatement = currentStatement + NEW_LINE_KEY;

      //Here, each paramater is going to be an Object. Let's parse into JSONObject and get corresponding value.
      for(var j = 0; j < params.length; j++) {

        var currentParam = params[j];
        var key = Object.keys(currentParam);    //TODO: key is actually surrounded by []. Check if this occurs in the parsed script too!
        var value = S(currentParam[key]).trim().s;

        if( S(key).contains(COMMENT_KEY) ) {      //if this is a comment, we enclose it within /*\n ... \n*/

          currentStatement = COMMENT_START_KEY + value + COMMENT_END_KEY + NEW_LINE_KEY + currentStatement + NEW_LINE_KEY;

        } else {

          //put the value in () brackets if not already inside one
          if( S(value).trim().length > 0 && !S(value).startsWith(ROUND_OPEN_KEY) ) {
            value = ROUND_OPEN_KEY + value;

            //we assume that closing bracket is also missing and blindly append it; else parsing it will be complex.
            value = value + ROUND_CLOSE_KEY;
          }

          // key = S(key).replaceAll("Parameter", "").s;
          currentStatement = currentStatement + key + BLANK_SPACE_KEY + value;


          //if this is the last parameter, append a ';' otherwise append a new line character 
          if(j == params.length - 2) {    //here it is '-2' because there is one "comment" parameter too
            currentStatement = currentStatement + SEMI_COLON_KEY;
          } else {
            currentStatement = currentStatement + NEW_LINE_KEY;
          }
        }

      }
    } else {
      currentStatement = currentStatement + SEMI_COLON_KEY + NEW_LINE_KEY;    //if there are no parameters, just put semicolon and we are done.
    }


    var operatorID = operator[ID_KEY];
    statusVariables.processedOperators[operatorID] = currentStatement;

    // If it is user defined operator, we have to put it at the top
    // so that the references below find it
    if(operator.type === "example.shape.User_Defined") {
      statusVariables.finalString = currentStatement + statusVariables.finalString;
    }

    // console.log("S: " + currentStatement);

    return currentStatement;
  }


  function processContainer(container, operators, connections, statusVariables, finalResult) {
    var firstStatement = "";
    var operatorProps = pstudio_config.get(container[TYPE_KEY]);   //get all properties of *this* operator type
    var lastTargetID = "";
    var lastOperatorID = "";
    var lastStatement = "";
    var searchTarget = "";
    statusVariables.processedOperators = {};    //reset processed operators so we do not confuse with future containers/operators
    // var processedMacroOps = {};
    /*
    define my_macro ($in) returns $out { 
     $out := filter($in) by x > y + 2;
    }
    */

    firstStatement = firstStatement + DEFINE_KEY + container.label;
    firstStatement = firstStatement + ROUND_OPEN_KEY + MACRO_INPUT_PREFIX + statusVariables.input_sequence + ROUND_CLOSE_KEY;
    statusVariables.input_sequence++;    //TODO We do not know if there could be more than one inputs to a MACRO

    firstStatement = firstStatement + RETURNS_KEY + MACRO_OUTPUT_PREFIX;
    // statusVariables.output_sequence++;      //TODO Same reason as above for statusVariables.input_sequence

    firstStatement = firstStatement + BLANK_SPACE_KEY + BRACE_OPEN_KEY + NEW_LINE_KEY;

    // Process all operators inside the macro definition
    for(var opsKey in operators) {
      var operator = operators[opsKey];
      // statusVariables.processedOperators[opsKey] = processOperator(operator);
      processOperator(operator, statusVariables, finalResult);
      lastOperatorID = opsKey;
      // if(Object.keys(connections).length === 0) {     // This means there are no connections, there is a single operator
      //   var op = statusVariables.processedOperators[opsKey];
      //   op = S(op).replaceAll(opsKey + INPUT_KEY + statusVariables.input_sequence, MACRO_INPUT_PREFIX).s;
      //   statusVariables.processedOperators[opsKey] = op;
      // }
    }

    // Process all connections now
    for(var connKey in connections) {
      var conn = connections[connKey];
      processConnection(conn, statusVariables, finalResult);
      lastTargetID = conn[TARGET_KEY][NODE_KEY];
    }

    if(statusVariables.processedOperators[lastTargetID] !== undefined) {
      lastStatement = statusVariables.processedOperators[lastTargetID];
      searchTarget = lastTargetID;
    } else {
      lastStatement = statusVariables.processedOperators[lastOperatorID];
      searchTarget = lastOperatorID;
    }
    
    if( lastStatement !== undefined && S(lastStatement).contains(searchTarget) ) {
      lastStatement = S(lastStatement).replaceAll(searchTarget + OUTPUT_KEY, MACRO_OUTPUT_PREFIX).s;
      statusVariables.processedOperators[searchTarget] = lastStatement;

      // statusVariables.finalString = statusVariables.finalString + NEW_LINE_KEY + lastStatement + NEW_LINE_KEY;
    }

    // lastStatement = statusVariables.processedOperators[lastOperatorID];
    // if( lastStatement !== undefined && S(lastStatement).contains(lastOperatorID) ) {
    //   lastStatement = S(lastStatement).replaceAll(lastOperatorID + OUTPUT_KEY, MACRO_OUTPUT_PREFIX).s;
    //   statusVariables.processedOperators[lastOperatorID] = lastStatement;
    // }

    for(var statementKey in statusVariables.processedOperators) {
      //Check if some operator has unprocessed variables
      if( S(statusVariables.processedOperators[statementKey]).contains(statementKey)) {
        var statement = statusVariables.processedOperators[statementKey];
        //FIXME This is the place to think about if MACRO supports more than one input. Currently $in0 is used by default
        statement = S(statement).replaceAll(statementKey + INPUT_KEY, MACRO_INPUT_PREFIX).s;
        statusVariables.processedOperators[statementKey] = statement;
        firstStatement = firstStatement + statement;

        // statement = S(statement).replaceAll(statementKey + OUTPUT_KEY, MACRO_OUTPUT_PREFIX).s;   //TODO We probably do not neet this
      }
    }

    statusVariables.finalString = firstStatement + statusVariables.finalString + lastStatement + BRACE_CLOSE_KEY + NEW_LINE_KEY;
    finalResult[statusVariables.finalResultIndex++] = statusVariables.finalString;
    statusVariables.finalString = "";           //reset script snippet for this container
  }


  function processConnection(connection, statusVariables, finalResult) {
    var sourceID = connection[SOURCE_KEY][NODE_KEY];
    var sourcePort = connection[SOURCE_KEY][PORT_KEY];
    var targetID = connection[TARGET_KEY][NODE_KEY];
    var targetPort = connection[TARGET_KEY][PORT_KEY];
    // console.log("INfo: " + sourceID + ", " + sourcePort + ", " + targetID + ", " + targetPort);

    var sourceStatement = statusVariables.processedOperators[sourceID];
    var targetStatement = statusVariables.processedOperators[targetID];

    // console.log("source: " + sourceStatement + "\ntarget: " + targetStatement);

    // String sourceStatement = idNodeMapping.get(sourceID);
    // String targetStatement = idNodeMapping.get(targetID);

    sourceStatement = S(sourceStatement).replaceAll(sourceID + OUTPUT_KEY, OUTPUT_PREFIX + statusVariables.output_sequence).s;
    targetStatement = S(targetStatement).replaceAll(targetID + UNDERSCORE_KEY + targetPort, OUTPUT_PREFIX + statusVariables.output_sequence).s;

    statusVariables.output_sequence++;

    //Update our Map to latest statement
    statusVariables.processedOperators[sourceID] = sourceStatement;
    statusVariables.processedOperators[targetID] = targetStatement;

    /*
    //  * Known problem here: When using an operator which needs an input, e.g. Project, and there is none in pstudio data, then that statement will not be considered here due to 'if'
    //  */
    if( !S(sourceStatement).contains(sourceID))   //this means every variable is processed
    {
      statusVariables.finalString = statusVariables.finalString + NEW_LINE_KEY + sourceStatement + NEW_LINE_KEY;
      // console.log("Adding: " + sourceStatement);
    }

    // console.log("\n\nsource: " + sourceStatement + "\ntarget: " + targetStatement);

  }


  function generateScript(parsedData) {
    var operatorsArray = {};
    var connectionsArray = {};
    var containersArray = {};

    var statusVariables = JSON.parse('{ "input_sequence": 0, "output_sequence": 0, "processedOperators": {}, "finalString": "", "finalResultIndex": 0}');
    var finalResult = [];

    //TODO: put this call to be performed asynchronously
    parsedData.forEach(function(element, index) {
      // We construct an array of all values with "id <=> element" mapping so its easy to retrieve elements
      // and reduce passes over input data
      if(element.userData.nature !== undefined && element.userData.nature === OPERATOR_KEY) {       //if nature is operator
        operatorsArray[element.id] = element;
      } else if(element.userData.nature !== undefined && element.userData.nature === CONNECTION_KEY) {
        connectionsArray[element.id] = element;
      } else if(element.userData.nature !== undefined && element.userData.nature === CONTAINER_KEY) {
        containersArray[element.id] = element;
      }
    });


    for(var key in containersArray) {
      var element = containersArray[key];
      var container_operators = {};
      var container_connections = {};

      //add all operators related to the container so we can send them for processing
      for(var j = 0; j < element.userData.composites.length; j++) {
        var opID = element.userData.composites[j];
        container_operators[opID] = operatorsArray[opID];

        //remove the operator so we don't process it again
        delete operatorsArray[opID];

        for(var connKey in connectionsArray) {
          var conn = connectionsArray[connKey];
          var sourceID = conn[SOURCE_KEY][NODE_KEY];
          var targetID = conn[TARGET_KEY][NODE_KEY];

          //if operator is either source or target and this connection is already not considered, add it
          if( (opID === sourceID) || (opID === targetID) && (container_connections[connKey] === undefined) ) {
            container_connections[connKey] = conn;
            //remove the connection so we don't process it again
            delete connectionsArray[connKey];
          }
        }
      }

      //process each Container here
      processContainer(element, container_operators, container_connections, statusVariables, finalResult);
    }

    
    // Let's process the remaining operators
    for(var opKey in operatorsArray) {
      processOperator(operatorsArray[opKey], statusVariables, finalResult);
    }


    //Now the connections, God there's too much to process
    for(var cKey in connectionsArray) {
      processConnection(connectionsArray[cKey], statusVariables, finalResult);
    }


    //Process the last connection again as the final output is still to be replaced with correct container.
    lastConnection = parsedData[parsedData.length-1];   //get the last connection

    var targetID = lastConnection[TARGET_KEY][NODE_KEY];
    var targetStatement = statusVariables.processedOperators[targetID];

    if( S(targetStatement).contains(targetID) ) {
      targetStatement = S(targetStatement).replaceAll(targetID + OUTPUT_KEY, FINAL_PREFIX).s;
      statusVariables.processedOperators[targetID] = targetStatement;

      statusVariables.finalString = statusVariables.finalString + NEW_LINE_KEY + targetStatement + NEW_LINE_KEY;
    }

    for(var statementKey in statusVariables.processedOperators) {
      //Check if some operator has unprocessed variables
      if( S(statusVariables.processedOperators[statementKey]).contains(statementKey)) {
        var statement = statusVariables.processedOperators[statementKey];
        //FIXME This is the place to think about if MACRO supports more than one input. Currently $in0 is used by default
        statement = S(statement).replaceAll(statementKey + INPUT_KEY, INPUT_PREFIX).s;
        
        //if there was a single operator, put output as $finalResult
        if(Object.keys(connectionsArray).length === 0) {
          statement = S(statement).replaceAll(statementKey + OUTPUT_KEY, FINAL_PREFIX).s;
        } else {      // put output as $result
          statement = S(statement).replaceAll(statementKey + OUTPUT_KEY, OUTPUT_PREFIX).s;
        }

        statusVariables.processedOperators[statementKey] = statement;
        statusVariables.finalString = statement + statusVariables.finalString;
      }
    }

    finalResult[statusVariables.finalResultIndex++] = statusVariables.finalString;
    statusVariables.finalString = "";
    for(var j = 0; j < finalResult.length; j++) {
      statusVariables.finalString = statusVariables.finalString + finalResult[j];
    }

    return statusVariables.finalString;
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

  // res.writeHeader('Content-Type', 'application/json');

  console.log("Request received!");

  var parsedData = JSON.parse(JSON.stringify(req.body.toGenerate.documentData));
  var fileName = req.body.toGenerate.name;
  var user = req.body.toGenerate.username;
    
  var generatedScript = generateScript(parsedData);

  console.log("generated: " + generatedScript);

  saveScriptToDB(generatedScript, fileName, user);  
});


app.post('/pipestudio/executeScript', function(req, res) {
    var parsedData = JSON.parse(JSON.stringify(req.body.toGenerate.documentData));
    var fileName = req.body.toGenerate.name;
    var user = req.body.toGenerate.username;

    console.log("in execute, file: " + fileName + ", user: " + user);
    
    //generate the script by default and save it to database so there are no inconsistencies
    // var generatedScript = generateScript(parsedData);
    // saveScriptToDB(script, fileName, user);

    var createDirectory = spawn("mkdir", [fileName]);

    createDirectory.on('exit', function(code) {
      console.log("folder created with name: " + fileName);
    });

    console.log("Exiting");

    

  });



};
