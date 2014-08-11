// declare the namespace for this example
var example = {
        command: {},
        shape:   {},
        connection: {},
        propertypane:   {},
        dialog : {}
};


draw2d.Connection.createConnection=function(sourcePort, targetPort, callback, dropTarget){

    // get the coordinate of the drop target element to place the context menu in a propper
    // way
    //
    // var pos = dropTarget.getAbsolutePosition();
    // pos = dropTarget.canvas.fromCanvasToDocumentCoordinate(pos.x,pos.y);
    
    // var context = $('<ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu">'+
    //                 '<li><a data-connector="example.shape.RegExConnection" tabindex="-1" href="#">User Response Transistion</a></li>'+
    //                 '<li><a data-connector="example.shape.AutoConnection" tabindex="-1" href="#">Automatic Transition</a></li>'+
    //                 '</ul>');
    // $("body").append(context);
    
    // context.show()
    //        .css({left:pos.x, top:pos.y})
    //        .find("a").on("click", function(){
    //             context.remove();
    //             var con = eval("new "+$(this).data("connector"));
    //             callback(con);
    //        });
  var type = $("#connections_menu").val();
  // var conn = eval("new " + $("#connections_menu").val());
  var conn = eval(new example.connection.GenericConnection(type, null));
  callback(conn);
};

/**
 * 
 * The **GraphicalEditor** is responsible for layout and dialog handling.
 * 
 * @author Andreas Herz
 * @extends draw2d.ui.parts.GraphicalEditor
 */
example.Application = Class.extend(
{
    NAME : "example.Application", 

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

        this.view = new example.View("canvas");
        this.toolbar = new example.Toolbar("toolbar",  this.view );
        this.propertyPane = new example.PropertyPane("property", this.view);
	    
	    
	       // layout FIRST the body
	       //
	       this.contentLayout = $('#container').layout({
	   	     north: {
	            resizable:false,
	            closable:false,
                spacing_open:0,
                spacing_closed:0,
                size:125,
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
                 size:120,
                 paneSelector: "#palette"
	         },
	         center: {
                 resizable:true,
                 closable:false,
                 spacing_open:0,
                 spacing_closed:0,
                 paneSelector: "#view"
	          }
	       });
	       
           this.appLayout = $('#view').layout({
  	   	     south: {
                   resizable:true,
                   closable:false,
                   spacing_open:5,
                   spacing_closed:5,
                   size:200,
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
      alert("calling save...");
      writer.marshal(this.view, $.proxy(function(jsonData) {
        // alert("Inside marshal, cookie: " + document.cookie);

        var documentObject = {
          "documentData" : jsonData, 
          "name": this.loadedDefinitionId,
          "username" : sessionStorage.getItem('username')
          };

        $.ajax({
            url: '/pipestudio/save',
            // dataType: "jsonp",
            data: { "toStore" : documentObject},
            type: 'POST',
            success: function () {
                // alert("Success in storage!");
            },
            error: function (err) {
                alert("Failure in storage" + JSON.stringify(err));
            },
        });
      },this));

    },
    
    loadDefinition: function(definitionId, jsonDocument)
    {
      console.log("data: " + definitionId + ", " + jsonDocument);
        $("#loadedFileName").text("loading...");
        this.view.clear();
      	this.loadedDefinitionId = definitionId;
        var reader = new example.Reader();
        reader.unmarshal(this.view, jsonDocument);
        $("#loadedFileName").html("<span class='muted'>Document:</span> "+definitionId);
    },

    resizeCanvas: function() {
      this.contentLayout.resizeAll();
    }

});
