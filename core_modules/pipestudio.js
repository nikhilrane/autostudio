//Using nconf for consistency, else its useless here to load specific operator properties.
var pstudio_config = require('nconf');
var S = require('string');
var spawn = require('child_process').spawn;
var path = require('path');
var fs = require('fs');
var walk = require('walk');
var formidable = require('formidable');
var util = require('util');

// We load config file blindly; its the developer's responsibility to keep it error-free!
pstudio_config.file({ file : './config/pipestudio_parser_config.json' });

//Constants
const EXECUTIONS_DIR = "/home/nikhilrane/git_rep/autostudio/executions/output";
const SCRIPT_PATH = "/home/nikhilrane/git_rep/autostudio/executions/scripts/first";
const COMPILER_PATH = "pflow_compiler";
const UPLOAD_DIR = "/home/nikhilrane/git_rep/autostudio/uploads";
const DB_NAME = "dbName";

const UNPARSED = "Unparsed";
const SCRIPTED = "Scripted";
const EXECUTING = "Executing...";
const EXEC_COMPLETE = "Execution Complete!";

//Generic constants
const TRUE_KEY = "true";
const FALSE_KEY = "false";
const ROUND_OPEN_KEY = "(";
const ROUND_CLOSE_KEY = ")";
const BRACE_OPEN_KEY = "{";
const BRACE_CLOSE_KEY = "}";
const SQUARE_OPEN_KEY = "[";
const SQUARE_CLOSE_KEY = "]";
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
const DEFINE_KEY = "define ";
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



module.exports = function(app, mongo, io, cookie, transporter) {

/*
 * Tasks:
 * - Remove hardcoded DB names to pick from config
 * - Move parser to a better place for genericness
 * - Check if parsing into a script is to be made async
 * - Log errors using bunyan
 */

  function sendSocketMessage(fileName, user, logToDB, sessionID, eventName, message) {
    message.output = SQUARE_OPEN_KEY +  new Date().toISOString() + SQUARE_CLOSE_KEY  + BLANK_SPACE_KEY + message.output;
    message.docName = fileName;
    
    if(logToDB) {
      logExecMessageToDB(fileName, user, eventName, sessionID, message);
    }

    io.sockets.in(sessionID).emit(eventName, message);
  }

  function writeScript(filePath, fileName, generatedScript, sessionID, user, eventName) {

    fs.writeFile(filePath, generatedScript, function (err) {
      if (err) {
        sendSocketMessage(fileName, user, false, sessionID, eventName, {output: "Error creating files.................FAILED", type: "error"});
        var error = "Error:\n" + err;
        sendSocketMessage(fileName, user, false, sessionID, eventName, {output: error, type: "error"});
        console.log("Could not write script file for execution. Error: " + err);
        //FIXME Better error handling
        throw err;
      }

      // We are here it means file is saved. Let's start execution
      // TODO nodejs is not getting PATH variable correctly, see if there is a fix!
      var outputFileName = fileName;
      var outputExecObject = "";

      if(path.extname(outputFileName).length > 1) {
        outputExecObject = S(outputFileName).replaceAll( path.extname(outputFileName), "").s;
        outputFileName = S(outputFileName).replaceAll( path.extname(outputFileName), ".cpp").s;
      } else {
        outputExecObject = outputFileName;
        outputFileName = outputFileName + ".cpp";
      }
      
      var outputPath = path.join(path.dirname(filePath), outputFileName);

      sendSocketMessage(fileName, user, true, sessionID, eventName, {output: "Starting execution...................", type: "message"});

      //TODO Move hard-coding to config file
      var scriptExecutor = spawn(SCRIPT_PATH, [pstudio_config.get(COMPILER_PATH), filePath, outputPath, path.dirname(filePath), outputExecObject]);


      scriptExecutor.stdout.on('data', function(data) {
        // data = "stdout: " + data;
        // console.log("stdout: " + data);
        if(data.length > 0) {
          // console.log("data1: " + data + "l: " + data.length);
          // console.log("data2: " + JSON.stringify(data));
          sendSocketMessage(fileName, user, true, sessionID, eventName, {output: data, type: "message"});
        }
        
        console.log("" + data);
      });

      scriptExecutor.stderr.on('data', function(err) {
        // data = "stderr: " + data;
        // err = "stderr1: " + err;
        // console.log("stderr1: " + err);
        sendSocketMessage(fileName, user, true, sessionID, eventName, {output: err, type: "error"});
      });

      scriptExecutor.on('error', function(err) {
        // console.log("stderr2: " + err);
        // err = "stderr2: " + err;
        sendSocketMessage(fileName, user, true, sessionID, eventName, {output: err, type: "error"});
        console.log("Error executing script: " + err);
      });

      scriptExecutor.once('exit', function(code, signal) {
        var message = "Execution completed with return code: " + code;
        sendSocketMessage(fileName, user, true, sessionID, eventName, {output: message, type: "message"});
        updateStatus(fileName, user, EXEC_COMPLETE);
        console.log("continued execution, " + code + ", " + signal);

        var userColl = mongo.collection('users');

        userColl.findOne({username : user}, function(err, userData) {
          if(err) {
            var error = "Error:\n" + err;
            throw new Error("Error while getting user information after execution: " + err);
          }

          // console.log("user info: " + JSON.stringify(userData));

          var coll = mongo.collection(pstudio_config.get(DB_NAME));

          coll.findOne({name: fileName, username : user}, {_id:0, script: 1, execMessages: 1, email_notification: 1}, function(err, documentData) {

            if(err) {
              var error = "Error:\n" + err;
              throw new Error("Error while getting document information after execution: " + err);
            }

            if(documentData.email_notification == "true") {

              var emailText = 'The execution of <b>' + fileName  + '</b> is complete. The executed script and execution log is attached to this email.<br /><br />';
              emailText = emailText + "\n The output files are available under <i>";
              emailText = emailText + S(path.dirname(filePath)).replaceAll(path.join(EXECUTIONS_DIR, user), "Output").s;
              emailText = emailText + "</i> and can be downloaded from AutoStudio app."

              var execLog = "";

              if(documentData.execMessages !== undefined) {
                for(var i=0; i < documentData.execMessages.length; i++) {
                  var message = documentData.execMessages[i];
                  // console.log("log " + i + ": " + message);
                  // console.log("message: " + message + "json message: " + JSON.stringify(message) + ", length: " + message.length + ", " + JSON.stringify(message).length);
                  
                  
                  if(message !== undefined) {
                    if(message.type === "error") {
                      message.output = 'Error: ' + message.output;
                    }

                    execLog = execLog + message.output + "\n";
                  }
                }
              }

              var mailOptions = {
                from: 'do not reply <noreply@autostudio.mailer>',
                to: userData.email,
                subject: fileName + ' Execution Complete', // Subject line
                html: emailText,
                attachments: [
                  {
                    filename: fileName,
                    content: documentData.script
                  },
                  {
                    filename: fileName + ".log",
                    content: execLog
                  }
                ]
              };

              // send mail with defined transport object
              transporter.sendMail(mailOptions, function(error, info) {
                if(error){
                    console.log(error);
                } else {
                    console.log('Message sent: ' + info.response);
                }
              });
            }

            

          });
        });
      });
    });

  }


  function checkPathsAndExecute(dirPath, fileName, user, generatedScript, files, sessionID, eventName) {

    sendSocketMessage(fileName, user, false, sessionID, eventName, {output: "Validating paths.......................", type: "message"});

    // Before starting execution, let's create the required paths
    fs.exists(dirPath, function(exists) {
      var filePath = path.join(dirPath, fileName);

      // We would probably always land up here as there is a timestamp involved.
      if(!exists) {
        // console.log(dirPath + " does not exist. Creating.");
        sendSocketMessage(fileName, user, false, sessionID, eventName, {output: "Creating required files..............", type: "message"});

        var createDirectory = spawn("mkdir", ['-p', dirPath]);    //for creation of parents if they do no exist

        // We schedule 'on exit' only once so that it does not fire in case 'on error' is executed
        createDirectory.once('exit', function(code) {
          // console.log("folder created with name: " + dirPath);

          for(var i=0; i < files.length; i++) {
            var from = path.join(UPLOAD_DIR, files[i]);
            var to = path.join(dirPath, files[i]);
            // console.log("Moving: " + from + " to " + to);
            fs.rename(from, to);
          }


          writeScript(filePath, fileName, generatedScript, sessionID, user, eventName);
        });

        createDirectory.on('error', function(err) {
          // logger.error("Error occured in " + MODULE + SEP + METHOD + CALLBACK_APPEND, {error: err});
          // throw new Error('Could not connect to mongodb: ' + err);
          //FIXME Do some better erorr handlings, currently just outputting to console
          sendSocketMessage(fileName, user, false, sessionID, eventName, {output: "Error creating files.................FAILED", type: "error"});
          var error = "Error:\n" + err;
          sendSocketMessage(fileName, user, false, sessionID, eventName, {output: error, type: "error"});
          console.log("Could not create directory for execution. Error: " + err);
        });
      } else {
        writeScript(filePath, fileName, generatedScript, sessionID, user, eventName);
      }

    });

  }

  


  function updateStatus(documentName, user, currentStatus) {
      var coll = mongo.collection(pstudio_config.get(DB_NAME));

      coll.update({name: documentName, username : user}, {$set: {status: currentStatus}}, function(err) {
        if(err) {
          var error = "Error:\n" + err;
          throw new Error("Error while updating document status: " + err);
        }

        //io.sockets.in(sessionID).emit(eventName, {output: "Storing script into Database.........DONE", type: "message"});

        //console.log("Script saved!");
      });
  }


  function logExecMessageToDB(documentName, user, eventName, sessionID, message) {
    // console.log("in log1: " + message);
    // console.log("in log2: " + JSON.stringify(message));

      var coll = mongo.collection(pstudio_config.get(DB_NAME));

      coll.update({name: documentName, username : user}, { $push: {execMessages: message}, $set: {status: 'Executing'}}, function(err) {
        if(err) {
          sendSocketMessage(documentName, user, false, sessionID, eventName, {output: "Error during storage.................FAILED", type: "error"});
          var error = "Error:\n" + err;
          sendSocketMessage(documentName, user, false, sessionID, eventName, {output: error, type: "error"});
          throw new Error("Error while saving execution status: " + err);
        }

        //io.sockets.in(sessionID).emit(eventName, {output: "Storing script into Database.........DONE", type: "message"});

        //console.log("Script saved!");
      });
  }



  function saveScriptToDB(generatedScript, documentName, user, sessionID, eventName) {
      var coll = mongo.collection(pstudio_config.get(DB_NAME));

      coll.update({name: documentName, username : user}, {$set: {script: generatedScript, status: 'Scripted', execMessages: []}}, function(err) {
        if(err) {
          sendSocketMessage(documentName, user, false, sessionID, eventName, {output: "Error during storage.................FAILED", type: "error"});
          var error = "Error:\n" + err;
          sendSocketMessage(documentName, user, false, sessionID, eventName, {output: error, type: "error"});
          throw new Error("Error while saving generated script: " + err);
        }

        sendSocketMessage(documentName, user, false, sessionID, eventName, {output: "Storing script into Database.........DONE", type: "message"});

        // console.log("Script saved!");
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

      currentStatement = currentStatement + BLANK_SPACE_KEY;

      //Here, each paramater is going to be an Object. Let's parse into JSONObject and get corresponding value.
      for(var j = 0; j < params.length; j++) {

        var currentParam = params[j];
        var key = Object.keys(currentParam);    //TODO: key is actually surrounded by []. Check if this occurs in the parsed script too!
        var value = S(currentParam[key]).trim().s;

        if( S(key).contains(COMMENT_KEY) ) {      //if this is a comment, we enclose it within /*\n ... \n*/

          currentStatement = COMMENT_START_KEY + value + COMMENT_END_KEY + NEW_LINE_KEY + currentStatement + NEW_LINE_KEY;

        } else {

          //put the value in () brackets if not already inside one, BELOW PART OF PUTTING () BRACKETS IS COMMENTED AS PIPEFLOW COMPLAINS ABOUT IT
          if( operatorProps.parameters[key].bracketsRequired && S(value).trim().length > 0 && !S(value).startsWith(ROUND_OPEN_KEY) ) {
            value = ROUND_OPEN_KEY + value;

            //we assume that closing bracket is also missing and blindly append it; else parsing it will be complex.
            value = value + ROUND_CLOSE_KEY;
          }

          currentStatement = currentStatement + key + BLANK_SPACE_KEY + value;


          //if this is the last parameter, append a ';' otherwise append a new line character 
          if(j == params.length - 2) {    //here it is '-2' because there is one "comment" parameter too
            currentStatement = currentStatement + SEMI_COLON_KEY;
          } else {
            currentStatement = currentStatement + BLANK_SPACE_KEY;   //This \n removed because pipeflow complains about it
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

    firstStatement = firstStatement + DEFINE_KEY + container.label + BLANK_SPACE_KEY;
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
      if(Object.keys(connections).length === 0) {     // This means there are no connections, there is a single operator
        var op = statusVariables.processedOperators[opsKey];
        op = S(op).replaceAll(opsKey + INPUT_KEY + (statusVariables.input_sequence - 1), MACRO_INPUT_PREFIX + (statusVariables.input_sequence - 1)).s;
        statusVariables.processedOperators[opsKey] = op;
      }
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
    
    if(lastConnection !== undefined && lastConnection.userData.nature === CONNECTION_KEY) {

      var targetID = lastConnection[TARGET_KEY][NODE_KEY];
      var targetStatement = statusVariables.processedOperators[targetID];

      if( S(targetStatement).contains(targetID) ) {
        targetStatement = S(targetStatement).replaceAll(targetID + OUTPUT_KEY, FINAL_PREFIX).s;
        statusVariables.processedOperators[targetID] = targetStatement;

        statusVariables.finalString = statusVariables.finalString + NEW_LINE_KEY + targetStatement + NEW_LINE_KEY;
      }
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

  function prepareExecution(parsedData, sessionID, eventName, fileName, user, files) {

    //generate the script by default and save it to database so there are no inconsistencies
    var generatedScript = generateScript(parsedData);

    sendSocketMessage(fileName, user, false, sessionID, eventName, {output: "Script generation....................COMPLETE", type: "message"});

    saveScriptToDB(generatedScript, fileName, user, sessionID, eventName);

    var today = new Date();
    var dateString = today.getDate() + UNDERSCORE_KEY + today.getMonth() + UNDERSCORE_KEY + today.getFullYear();

    // This will create a path: ./executions/output/<username>/<date_month_year>/<filename_dateTime>
    var dirPath = path.join(EXECUTIONS_DIR, user, dateString, fileName + UNDERSCORE_KEY + today.toJSON());

    checkPathsAndExecute(dirPath, fileName, user, generatedScript, files, sessionID, eventName);
  }


app.get('/pipestudio/getList', function(req, res) {

  //we can get username from both ways (in request set by express-session or request data)
  var user = req.query.username;
  // console.log("user: " + user);

  res.writeHeader('Content-Type', 'application/json');

  //get all document names for this user
  var coll = mongo.collection(pstudio_config.get(DB_NAME));

  //TODO: check if we support localStorage and change columns below
  var stream = coll.find({ username : user }, {name: 1, status: 1, _id:1}).sort({name: 1}).stream();
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


app.get('/pipestudio/getHomePageList', function(req, res) {

  //we can get username from both ways (in request set by express-session or request data)
  var user = req.query.username;
  // console.log("user: " + user);

  res.writeHeader('Content-Type', 'application/json');

  //FIXME: get document names for ALL Apps for this user
  var coll = mongo.collection(pstudio_config.get(DB_NAME));

  //TODO: check if we support localStorage and change columns below
  var stream = coll.find({ username : user }, {_id:0, name: 1, status: 1, email_notification: 1}).sort({accessedTimestamp: -1}).limit(5).stream();
  var jsonData = JSON.parse('{"tuples": [], "appName":"pipestudio" }');
  stream.on("data", function(item) {

    if(item.email_notification == "true") {
      item.email_notification = "checked";
    } else {
      item.email_notification = "";
    }

    jsonData["tuples"].push(item);
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
  var coll = mongo.collection(pstudio_config.get(DB_NAME));

  //TODO: check if we support localStorage and change columns below
  coll.findOne({name: docName, username : user}, {"documentData":1, "name":1, _id:0}, function(err, jsonData) {
    if(err) { throw new Error("Error while getting: " + err + ", data: " + jsonData); }

    // console.log("Sending this: " + JSON.stringify({result: jsonData}));

    res.end(JSON.stringify( { result: jsonData }));

    coll.update({name: docName, username : user}, {$set: {accessedTimestamp: (new Date()).toJSON()}}, function(err) {
        if(err) {
          // io.sockets.in(sessionID).emit(eventName, {output: "Error during storage.................FAILED", type: "error"});
          // var error = "Error:\n" + err;
          // io.sockets.in(sessionID).emit(eventName, {output: error, type: "error"});
          throw new Error("Error while saving: " + err);
        }

        // io.sockets.in(sessionID).emit(eventName, {output: "Storing script into Database.........DONE", type: "message"});

        // console.log("accessedTimestamp updated!");
      });
  });
});


app.post('/pipestudio/save', function(req, res) {

  var jsonData = req.body.toStore;

  res.writeHeader('Content-Type', 'application/json');
  
  // mongo.save(jsonData, pstudio_config.get(DB_NAME), function(err) {
  //   if(err) { throw new Error("Error while saving: " + err); }

  //   res.end(JSON.stringify({result: true}));
  // });


  var coll = mongo.collection(pstudio_config.get(DB_NAME));
  coll.update({name: jsonData.name, username : jsonData.username}, jsonData, {upsert: true}, function(err) {
    if(err) {
      // io.sockets.in(sessionID).emit(eventName, {output: "Error during storage.................FAILED", type: "error"});
      // var error = "Error:\n" + err;
      // io.sockets.in(sessionID).emit(eventName, {output: error, type: "error"});
      throw new Error("Error while saving in save call: " + err);
    }

    // io.sockets.in(sessionID).emit(eventName, {output: "Storing script into Database.........DONE", type: "message"});

    // console.log("Document saved!");
  });

  res.end(JSON.stringify({result: true}));

});



app.post('/pipestudio/generateScript', function(req, res) {

  // res.writeHeader('Content-Type', 'application/json');

  var eventName = 'generating_script';
  var sessionID = cookie.parse(req.headers.cookie)['connect.sid'];
  var parsedData = JSON.parse(JSON.stringify(req.body.toGenerate.documentData));
  var fileName = req.body.toGenerate.name;
  var user = req.body.toGenerate.username;

  sendSocketMessage(fileName, user, false, sessionID, eventName, {output: "Generating script....................STARTED", type: "message"});
    
  var generatedScript = generateScript(parsedData);

  // console.log("generated: " + generatedScript);
  //FIXME Remove these hardcoded tags, let's handle on client side
  sendSocketMessage(fileName, user, false, sessionID, eventName, {output: "Script generation....................COMPLETE\n\nScript:\n<font color='#008C8C'>" + generatedScript + "</font>", type: "message"});

  saveScriptToDB(generatedScript, fileName, user, sessionID, eventName);
  
  res.end(JSON.stringify({ result: true }));
});


app.post('/pipestudio/uploadFile', function(req, res) {

  var form = new formidable.IncomingForm();
  form.uploadDir = UPLOAD_DIR;

  form.on('file', function(field, file) {
    //rename the incoming file to the file's name
    fs.rename(file.path, form.uploadDir + "/" + file.name);
  });

  form.parse(req, function(err, fields, files) {
    // res.writeHead(200, {'content-type': 'text/plain'});
    // res.write('received upload:\n\n');
    // console.log(util.inspect({fields: fields, files: files}));
    console.log("file received!");
    
  });

  res.end(JSON.stringify( { result: true }));

});


app.post('/pipestudio/executeScript', function(req, res) {

  

  var eventName = 'executing_script';
  var sessionID = cookie.parse(req.headers.cookie)['connect.sid'];
  var parsedData = JSON.stringify(req.body.toGenerate.documentData);
  var fileName = req.body.toGenerate.name;
  var user = req.body.toGenerate.username;
  var files = req.body.toGenerate.files;

  console.log("Request received, sessionID: " + req.sessionID + "\n from cookie: " + sessionID);

  if(files === undefined) {
    files = [];
  }

  sendSocketMessage(fileName, user, false, sessionID, eventName, {output: "Generating script....................STARTED", type: "message"});
  // console.log("parsedData: " + parsedData + ", l: " + parsedData.length);

  // If there is data inside request, process it and execute
  if(parsedData !== undefined && parsedData.length > 2) {
    prepareExecution(JSON.parse(parsedData), sessionID, eventName, fileName, user, files);
  } else {
    // If there is no data passed inside request, then get it from DB
    var coll = mongo.collection(pstudio_config.get(DB_NAME));
    coll.findOne({name: fileName, username : user}, {"documentData":1, "name":1, _id:0}, function(err, jsonData) {
      if(err) { throw new Error("Error while getting: " + err + ", data: " + jsonData); }

      prepareExecution(jsonData.documentData, sessionID, eventName, fileName, user, files);
    });
  }
  

  res.end(JSON.stringify( { result: true }));
});



app.get('/pipestudio/downloadExecs', function(req, res) {

  var user = req.query.username;
  var pathToWalk = path.join(EXECUTIONS_DIR, user);
  var walker;

  walker = walk.walk(pathToWalk, { followLinks: false, filters: []});

  var dirTree = {};
  walker.on("names", function (root, nodeNamesArray) {
    var p = S(root).replaceAll(pathToWalk, "output").s;
    dirTree[p] = nodeNamesArray;
   
  });

  walker.on('end', function() {
    res.end(JSON.stringify( { result: dirTree }));
  });

});


app.post('/pipestudio/downloadFile', function(req, res) {
  var user = req.body.username;
  var filePath = req.body.fileToDownload;
  console.log("user: " + user + ", filePath: " + filePath);
  var finalPath = filePath.replace("output", path.join(EXECUTIONS_DIR, user));
  console.log("finalPath: " + finalPath);

  //res.attachment();
  res.setHeader("Content-Disposition", "attachment; filename=" + path.basename(finalPath));

  res.download(finalPath, path.basename(finalPath), function(err) {
    if(err) {
      console.log("Error during download: " + err);
    } else {
      console.log("File download completed!");
    }
  });
});

app.get('/pipestudio/getExecMessages', function(req, res) {

  var user = req.query.username;
  var fileName = req.query.documentName;

  var coll = mongo.collection(pstudio_config.get(DB_NAME));
  coll.findOne({name: fileName, username : user}, {"execMessages":1, "script": 1}, function(err, jsonData) {
    if(err) { throw new Error("Error while getting: " + err + ", data: " + jsonData); }

    res.end(JSON.stringify( { result: jsonData }));
  });

  
});


app.post('/pipestudio/deleteDoc', function(req, res) {
  var user = req.body.username;
  var documentName = req.body.documentName;
  // var documentID = "ObjectId(\"" + req.body.documentID + "\")";
  // console.log("have to delete: " + documentName);

  var coll = mongo.collection(pstudio_config.get(DB_NAME));
  coll.remove({name: documentName, username : user}, function(err, jsonData) {
    if(err) { throw new Error("Error while getting: " + err + ", data: " + jsonData); }
    console.log("Deleted: " + documentName + ", user: " + user);

    res.end(JSON.stringify( { result: true }));
  });
  
});


app.post('/pipestudio/notify', function(req, res) {
  var user = req.body.username;
  var documentName = req.body.documentName;
  var notify = req.body.notify;

  var coll = mongo.collection(pstudio_config.get(DB_NAME));
  coll.update({name: documentName, username : user}, {$set: {email_notification: notify}}, function(err) {
    if(err) {
      var error = "Error:\n" + err;
      throw new Error("Error while updating email notification: " + err);
    }

    res.end(JSON.stringify( { result: true }));
  });

  
});




};
