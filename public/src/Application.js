// declare the namespace for AutoStudio
var autostudio = {
        command: {},
        shape:   {},
        connection: {},
        propertypane:   {},
        dialog : {}
};


// Attach an override so we can support various connection types in AutoStudio
draw2d.Connection.createConnection=function(sourcePort, targetPort, callback, dropTarget){

  var type = $("#connections_menu").val();
  // var conn = eval("new " + $("#connections_menu").val());
  var conn = eval(new autostudio.connection.GenericConnection(type, null));
  callback(conn);
};

/**
 * 
 * The **GraphicalEditor** is responsible for layout and dialog handling.
 * 
 * @author Andreas Herz
 * @extends draw2d.ui.parts.GraphicalEditor
 */
autostudio.Application = Class.extend(
{
    NAME : "autostudio.Application", 

    /**
     * @constructor
     * 
     * @param {String} canvasId the id of the DOM element to use as paint container
     */
    init : function()
    {
        RegexColorizer.addStyleSheet();
        
        var compiledTemplate = templates["OperatorImageList"];
        var renderedTemplate = $(compiledTemplate.render(pstudioJSON));
        $("#palette").append(renderedTemplate);

        this.view = new autostudio.View("canvas");
        this.toolbar = new autostudio.Toolbar("toolbar",  this.view );
        this.propertyPane = new autostudio.PropertyPane("property", this.view);
	    
	    
	       // layout FIRST the body
	       //
	       this.contentLayout = $('#container').layout({
	   	     north: {
	            resizable:false,
	            closable:false,
                spacing_open:0,
                spacing_closed:0,
                size:115,
	            paneSelector: "#toolbar"
	         },
	         center: {
	            resizable:false,
	            closable:false,
                spacing_open:0,
                spacing_closed:0,
	            paneSelector: "#content"
	         }
	       });

           this.editorLayout = $('#content').layout({
  	         center: {
                   resizable:false,
                   closable:false,
                   spacing_open:0,
                   spacing_closed:0,
                   paneSelector: "#editor"
  	          }
  	       });

           this.appLayout = $('#editor').layout({
	   	     west: {
                 resizable:false,
                 closable:false,
                 spacing_open:0,
                 spacing_closed:0,
                 size:"7%",
                 paneSelector: "#palette"
	         },
	         center: {
                 resizable:true,
                 closable:false,
                 spacing_open:0,
                 spacing_closed:0,
                 size:"93%",
                 paneSelector: "#view"
	          }
	       });
	       
           this.appLayout = $('#view').layout({
  	   	     south: {
                   resizable:true,
                   closable:false,
                   spacing_open:5,
                   spacing_closed:5,
                   size:"28%",
                   paneSelector: "#property",
                   onresize:$.proxy(function(){
                       this.propertyPane.onResize();
                   },this)
  	         },
  	         center: {
                   resizable:true,
                   closable:false,
                   spacing_open:5,
                   spacing_closed:5,
                   paneSelector: "#canvas"
  	          }
  	       });
           
           // this.loadDefinition("system.json");
    },
    
    executeCommand: function(cmd)
    {
        this.view.getCommandStack().execute(cmd);
    },

    /**
     * @method
     * Return the view or canvas of the application. Required to access the document itself
     * 
     */
    getView: function(){
        return this.view;
    },

    
    saveAsDefinition: function(definitionId)
    {
      // alert("Inside saveAs");
      //   this.backend.del(this.loadedDefinitionId, $.proxy(function(){
      //       this.loadedDefinitionId = definitionId;
      //       var writer = new draw2d.io.json.Writer();    
      //       writer.marshal(this.view, $.proxy(function(data){
      //         //MyAdd
      //         alert("JSON: "+JSON.stringify(data));
      //           this.backend.save(this.loadedDefinitionId, data, $.proxy(function(){
      //               this.view.getCommandStack().markSaveLocation();
      //           },this));
      //       },this));
      //   },this));
    },

    createDefinition: function(definitionId)
    {
      $("#loadedFileName").text("loading...");
      this.view.clear();
      this.loadedDefinitionId = definitionId;
      $("#loadedFileName").html("<span class='muted'>Document:</span> "+definitionId);
    },


    saveToJSON: function(fileName) {
      var writer = new draw2d.io.json.Writer();
      writer.marshal(this.view, $.proxy(function(data) {

        var dataString = JSON.stringify(data);

        var blob = new Blob([dataString], {type: "text/plain;charset=utf-8"});
        saveAs(blob, fileName);
    
      },this));
    },


    saveToPNG: function(fileName) {
      var writer = new draw2d.io.png.Writer();
      var xCoords = [];
      var yCoords = [];
      this.view.getFigures().each(function(i,f){
          var b = f.getBoundingBox();
          xCoords.push(b.x, b.x+b.w);
          yCoords.push(b.y, b.y+b.h);
      });
      var minX   = Math.min.apply(Math, xCoords);
      minX = (minX-20) < 0? 0 : (minX-20);

      var minY   = Math.min.apply(Math, yCoords);
      minY = (minY-20) < 0? 0 : (minY-20);

      var width  = Math.max.apply(Math, xCoords)-minX + 20;
      var height = Math.max.apply(Math, yCoords)-minY + 20;
      
      var writer = new draw2d.io.png.Writer();
      writer.marshal(this.view,function(data) {
        
        var dataString = JSON.stringify(data);

        $('#canvasImage').attr('height', height).attr('width', width);

        var canvas = document.getElementById('canvasImage');
        var ctx = canvas.getContext('2d');
        var img = document.createElement('IMG');

        img.src = data;

        img.onload =function () {
            ctx.drawImage(img, 0, 0);
                canvas.toBlob(function(blob) {
                    saveAs(blob, fileName);
                }, "image/png");

                // console.log("saved image!");
        };
      }, new draw2d.geo.Rectangle(minX,minY,width,height));
    },


    saveToSVG: function(fileName) {
      var writer = new draw2d.io.svg.Writer();
      writer.marshal(this.view, $.proxy(function(data) {

        // var dataString = JSON.stringify(data);

        var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
        saveAs(blob, fileName);
    
      },this));
    },

    exportTo: function(type) {
      var fileName = "";

      if(this.loadedDefinitionId === undefined) {
        //TODO: Ask for name here
        fileName = "export";
      } else {
        fileName = this.loadedDefinitionId;
      }

      switch(type) {
        case "json":  fileName = fileName + ".json";
                      this.saveToJSON(fileName);
                      break;

        case "png":   fileName = fileName + ".png";
                      this.saveToPNG(fileName);
                      break;

        case "svg":   fileName = fileName + ".svg";
                      this.saveToSVG(fileName);
                      break;

        //Export to JSON format by default
        default   :   fileName = fileName + ".json";
                      this.saveToJSON(fileName);
                      break;

      }
    },

        
    saveDefinition: function()
    {

      //This is to save to DB
      var writer = new draw2d.io.json.Writer();
      // alert("calling save...");
      writer.marshal(this.view, $.proxy(function(jsonData) {
        // alert("Inside marshal, cookie: " + document.cookie);

        var documentObject = {
          "name": this.loadedDefinitionId,
          "appName": 'PipeStudio',
          "documentData" : jsonData, 
          "status": 'Unparsed',
          "email_notification": '',
          "username" : sessionStorage.getItem('username'),
          "creationTimestamp" : (new Date()).toJSON(),
          "accessedTimestamp" : (new Date()).toJSON(),
          };

        $.ajax({
            url: '/pipestudio/save',
            // dataType: "jsonp",
            data: { "toStore" : documentObject},
            type: 'POST',
            success: function () {
                // alert("Success in storage!");
                $('#alertDiv').show('fast');
                setTimeout(function() {
                  $('#alertDiv').hide('slow');
                }, 5000);
            },
            error: function (err) {
                alert("Failure in storage" + JSON.stringify(err));
            },
        });
      },this));

    },
    
    loadDefinition: function(definitionId, jsonDocument)
    {
      // console.log("data: " + definitionId + ", " + jsonDocument);
        $("#loadedFileName").text("Loading...");
        this.view.clear();
      	this.loadedDefinitionId = definitionId;
        var reader = new autostudio.Reader();
        reader.unmarshal(this.view, jsonDocument);
        $("#loadedFileName").html("<span class='muted'><u>Flow-Design:</u></span> "+definitionId);
    },

    updateFigureParameter: function(paramName, paramValue) {
        this.propertyPane.updateParameter(paramName, paramValue);
    },

    resizeCanvas: function() {
      this.contentLayout.resizeAll();
    }

});
