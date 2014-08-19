
example.Toolbar = Class.extend({
	
	init:function(elementId, view){
		this.html = $("#"+elementId);
		this.view = view;
		
		// register this class as event listener for the canvas
		// CommandStack. This is required to update the state of 
		// the Undo/Redo Buttons.
		//
		view.getCommandStack().addEventListener(this);

		// Register a Selection listener for the state hnadling
		// of the Delete Button
		//
		view.addSelectionListener(this);

		var north = $("<div></div>");
		
		// var headStrip = $('<div style="height:40px; border-style: solid; border-width: 2px; border-color: red;"><div class="navbar navbar-inverse navbar-fixed-top" role="navigation"><div class="container"><div class="navbar-header"><button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse"><span class="sr-only">Toggle navigation</span><span class="icon-bar"></span><span class="icon-bar"></span><span class="icon-bar"></span></button><a class="navbar-brand" href="#">Project name</a></div><div class="collapse navbar-collapse"><ul class="nav navbar-nav"><li class="active"><a href="#">Home</a></li><li><a href="#about">About</a></li><li><a href="#contact">Contact</a></li></ul></div></div></div></div>');
		var headStrip = $('<div style="height:40px;"> <div class="navbar navbar-inverse navbar-fixed-top" role="navigation"><div class="container"><div class="navbar-header"><button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse"><span class="sr-only">Toggle navigation</span><span class="icon-bar"></span><span class="icon-bar"></span><span class="icon-bar"></span></button><a class="navbar-brand" href="#">Project name</a></div><div class="collapse navbar-collapse"><ul class="nav navbar-nav"><li class="active"><a href="#">Home</a></li><li><a href="#about">About</a></li><li><a href="#contact">Contact</a></li></ul></div></div></div> </div>');

		// var buttonBar = $('<div class="well-small" style="border-style: solid; border-width: 2px; border-color: blue;"></div>');
		// var buttonBar = $('<div class="well-small"> <div class="row"> </div>');
		var buttonBar = $('<div class="row"> </div>');

		// buttonBar.append($('<div class="ui-layout-content"> <div class="well well-small" style="border-style: solid; border-width: 2px; border-color: red;"></div></div>'));
		this.html.append(north);
		north.append(headStrip);
		north.append(buttonBar);

		// this.html.append(buttonBar);
		
		// the branding
		// buttonBar.append($("<b><span id='title' style='font-size:24px;color:#278A03;font-family:sans-serif' class='muted'>PipeStudio</span></b>"));
		buttonBar.append($('<div class="col-xs-1"> <H4>' + pstudioJSON.appName + ' </H4> </div>'));

    var buttonGroup = $('<div class="col-xs-1 btn-group"></div>');
    buttonGroup.append('<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">Document <span class="caret"></span></button>');
    buttonBar.append(buttonGroup);

    var mainUL = $('<ul class="dropdown-menu" role="menu"></ul>');
    buttonGroup.append(mainUL);
    
    
    var li = $('<li></li>');
    this.newButton  = $('<a href="#">New</a>');
    buttonGroup.append(li);
    this.newButton.click($.proxy(function(){
        (new example.dialog.NewDialog()).show();
    },this));
    li.append(this.newButton);
    mainUL.append(li);

    li = $('<li></li>');
    this.openButton  = $('<a href="#">Open</a>');
    buttonGroup.append(li);
    this.openButton.click($.proxy( function() {
    	// var user = sessionStorage.getItem('username');
    	// alert("here: " + user);

    	$.ajax({
            url: '/pipestudio/getList',
            // dataType: "jsonp",
            data: { "username" : sessionStorage.getItem('username') },
            type: 'GET',
            success: function (json) {
                // alert("Success in storage! \nString: " + JSON.stringify(json));


              //TODO: Add this to a Hogan template
              var templ = "<style type='text/css'>"+
"      body"+
"      {"+
"        background-color:#eee;"+
"        counter-reset: Serial;"+
"      }"+
"      table"+
"      {"+
"          border-collapse: separate;"+
"      }"+
"      tr"+
"      {"+
"        text-align:left;"+
"      }"+
"      tr td:first-child:before"+
"      {"+
"        counter-increment: Serial;"+
"        content: \"\" counter(Serial);"+
"      }"+
"  </style>"+
"<script>"+
                  "function getDocument(docName) {"+
          "       		$.ajax({"+
          "                url: '/pipestudio/getDoc',"+
          "                data: { "+
          "                	\"documentName\" : docName,"+
          "                	\"username\" : sessionStorage.getItem(\"username\")"+
          "                },"+
          "                type: 'GET',"+
          "                success: function (jsonData) {"+
          "					 var docData = JSON.stringify(JSON.parse(jsonData).result.documentData);"+
          "                    app.loadDefinition(docName, docData);"+
          "                },"+
          "                error: function (err) {"+
          "                    alert(\"Failure in getting doc\" + JSON.stringify(err));"+
          "                },"+
          "            });"+
          "	    }"+
                  "</script>"+
                  "<div class='modal fade bs-example-modal-lg'>"+
            "<div class='modal-dialog'>"+
             " <div class='modal-content'>"+
              "  <div class='modal-header'>"+
               "   <button type='button' class='close' data-dismiss='modal'><span aria-hidden='true'>&times;</span>"+
                "  <span class='sr-only'></span></button>"+
                 " <h4 class='modal-title'>Documents List</h4>"+
                "</div>"+
                "<div id='modal-body' class='modal-body'>"+
                  "<table class=\"table table-hover\">"+
                  "<thead>"+
              "<tr>"+
                "<th><b>#</b></th>"+
                "<th><b>Document Name</b></th>"+
                "<th><b>Open Document</b></th>"+
              "</tr>"+
            "</thead>"+
                  "<tbody> {{#result}}"+
                  "<tr>"+
                    "<td></td>"+
                    "<td> {{name}} </td>"+
                    "<td> <button type='button' class='btn btn-info' data-dismiss='modal' onclick='getDocument(\"{{name}}\")' >Open</button> </td>"+
                  "</tr> {{/result}}"+
                  "</tbody>"+
                  "</table>"+
                  "</div>"+
                "<div class='modal-footer'>"+
                  "<button type='button' class='btn btn-primary' data-dismiss='modal'>Close</button>"+
                  
                "</div>"+
              "</div><!-- /.modal-content -->"+
            "</div><!-- /.modal-dialog -->"+
          "</div><!-- /.modal -->";
                  
           var data = JSON.parse(json);
           var compiled = Hogan.compile(templ);
           var renderedTemplate = $(compiled.render(data));

           // alert($("#newModal").html());
           $("#newModal").html(compiled.render(data));
           $(".bs-example-modal-lg").modal();



          },
          error: function (err) {
              alert("Failure in storage" + JSON.stringify(err));
          },
      });

 		}, this)).attr("disabled",false);
    li.append(this.openButton);
    mainUL.append(li);

    // this.newButton  = $("<button id='newDocument' class='btn btn-info'>New</button>");
    // buttonGroup.append(this.newButton);
    // this.newButton.click($.proxy(function(){
    //     (new example.dialog.NewDialog()).show();
    // },this));


    li = $('<li></li>');
    this.saveButton  = $('<a href="#">Save</a>');
    buttonGroup.append(li);
    this.saveButton.click($.proxy(function(){
        app.saveDefinition();
    },this)).attr("disabled",false);
    li.append(this.saveButton);
    mainUL.append(li);
    mainUL.append('<li class="divider"></li>');

    li = $('<li></li>');
    this.importJSONButton  = $('<a href="#">Import JSON..</a>');
    buttonGroup.append(li);

    this.importJSONButton.click($.proxy( function() {

       var fileSelector = $("<input type='file' id='storage_files' name='files' />").on('change', $.proxy(function(event){
          $("#modal-background, #modal-content").remove();
          var f = event.target.files[0]; // FileList object
          f.title = f.name;
          var reader = new FileReader();
          // Closure to capture the file information.
          reader.onload = function(e) {
              app.loadDefinition(f.name, e.target.result);
          };
          // Read in the image file as a data URL.
          reader.readAsText(f);
      }));

       fileSelector.trigger('click');
    },this)).attr("disabled",false);

    li.append(this.importJSONButton);
    mainUL.append(li);
    mainUL.append('<li class="divider"></li>');


    li = $('<li></li>');
    this.exportJSONButton  = $('<a href="#">Export as JSON...</a>');
    buttonGroup.append(li);
    this.exportJSONButton.click($.proxy(function(){
      app.exportTo("json");       
    },this)).attr("disabled", false);
    li.append(this.exportJSONButton);
    mainUL.append(li);


    li = $('<li></li>');
    this.exportPNGButton  = $('<a href="#">Export as PNG...</a>');
    buttonGroup.append(li);
    this.exportPNGButton.click($.proxy(function(){
      app.exportTo("png");        
    },this)).attr("disabled", false);
    li.append(this.exportPNGButton);
    mainUL.append(li);

    li = $('<li></li>');
    this.exportSVGButton  = $('<a href="#">Export as SVG...</a>');
    buttonGroup.append(li);
    this.exportSVGButton.click($.proxy(function(){
      app.exportTo("svg");        
    },this)).attr("disabled", false);
    li.append(this.exportSVGButton);
    mainUL.append(li);


    mainUL.append('<li class="divider"></li>');

    
    li = $('<li></li>');
    this.generateScriptButton  = $('<a href="#">Generate Script</a>');

    buttonGroup.append(li);
    this.generateScriptButton.click($.proxy(function()  {


      var writer = new draw2d.io.json.Writer();
      // alert("calling parse...");
      writer.marshal(this.view, $.proxy(function(jsonData) {
        // alert("Inside marshal, cookie: " + document.cookie);

        var documentObject = {
          "documentData" : jsonData, 
          "name": app.loadedDefinitionId,
          "username" : sessionStorage.getItem('username')
          };

          // alert("sending: " + JSON.stringify(documentObject));

        $.ajax({
            url: '/pipestudio/generateScript',
            // dataType: "jsonp",
            data: { "toGenerate" : documentObject },
            type: 'POST',
            success: function(script) {
                console.log("Success in parse! \n" + JSON.stringify(script));
            },
            error: function(err) {
                console.log("Failure in parse" + JSON.stringify(err));
            },
        });
      },this));

    },this)).attr("disabled",false);
    li.append(this.generateScriptButton);
    mainUL.append(li);

    li = $('<li></li>');
    this.executeScriptButton  = $('<a href="#">Generate & Execute Script</a>');

    buttonGroup.append(li);
    this.executeScriptButton.click($.proxy(function()  {


      var writer = new draw2d.io.json.Writer();
      // alert("calling parse...");
      writer.marshal(this.view, $.proxy(function(jsonData) {
        // alert("Inside marshal, cookie: " + document.cookie);

        var documentObject = {
          "documentData" : jsonData, 
          "name": app.loadedDefinitionId,
          "username" : sessionStorage.getItem('username')
          };

          // alert("sending: " + JSON.stringify(documentObject));

        $.ajax({
            url: '/pipestudio/executeScript',
            // dataType: "jsonp",
            data: { "toGenerate" : documentObject },
            type: 'POST',
            success: function(script) {
                console.log("Success in execute script! \n" + JSON.stringify(script));
            },
            error: function(err) {
                console.log("Failure in execute script" + JSON.stringify(err));
            },
        });
      },this));

    },this)).attr("disabled",false);
    li.append(this.executeScriptButton);
    mainUL.append(li);


    buttonGroup = $('<div class="col-xs-1 btn-group"></div>');
    buttonGroup.append('<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">View <span class="caret"></span></button>');
    buttonBar.append(buttonGroup);

    mainUL = $('<ul class="dropdown-menu" role="menu"></ul>');
    buttonGroup.append(mainUL);

    li = $('<li></li>');
    this.zoomInButton  = $('<a href="#">Zoom In</a>');
    this.zoomInButton.click($.proxy(function(){

      this.view.setZoom(this.view.getZoom()*0.7,true);
        app.resizeCanvas();     //this call is not necessary but example code has it hence keeping it here.
    },this)).attr("disabled", false );
    li.append(this.zoomInButton);
    mainUL.append(li);

    li = $('<li></li>');
    this.zoomResetButton  = $('<a href="#">1:1</a>');
    this.zoomResetButton.click($.proxy(function(){

      this.view.setZoom(1.0,true);
        app.resizeCanvas();     //this call is not necessary but example code has it hence keeping it here.
    },this)).attr("disabled", false );
    li.append(this.zoomResetButton);
    mainUL.append(li);

    li = $('<li></li>');
    this.zoomOutButton  = $('<a href="#">Zoom Out</a>');
    this.zoomOutButton.click($.proxy(function(){

      this.view.setZoom(this.view.getZoom()*1.3,true);
        app.resizeCanvas();     //this call is not necessary but example code has it hence keeping it here.
    },this)).attr("disabled", false );
    li.append(this.zoomOutButton);
    mainUL.append(li);
    mainUL.append('<li class="divider"></li>');

    li = $('<li></li>');
    this.showGridButton  = $('<a href="#">Show Grid <span id="showGridTick" style="display:none;" class="glyphicon glyphicon-ok"></span></a>');
    this.showGridButton.click($.proxy(function(){

        if(this.view.gridPolicy) {
          this.view.gridPolicy = false;
            this.view.installEditPolicy(new draw2d.policy.canvas.SnapToGeometryEditPolicy());
            this.showGridButton.find(".glyphicon").css('display', 'none');
        } else {
          this.view.gridPolicy = true;
            this.view.installEditPolicy(new draw2d.policy.canvas.SnapToGridEditPolicy());
            this.showGridButton.find(".glyphicon").css('display', 'inline');
        }

    },this)).attr("disabled", false);
    li.append(this.showGridButton);
    mainUL.append(li);



    
    buttonGroup = $('<div class="col-xs-2 btn-group"></div>');
    buttonBar.append(buttonGroup);
		 
		// Inject the UNDO Button and the callbacks
		//
		this.undoButton  = $("<button class='btn btn-warning btn-sm'>Undo</button>");
		buttonGroup.append(this.undoButton);
		this.undoButton.click($.proxy(function(){
		       this.view.getCommandStack().undo();
		},this)).attr("disabled",true);

		// Inject the REDO Button and the callback
		//
		this.redoButton  = $("<button class='btn btn-warning btn-sm'>Redo</button>");
		buttonGroup.append(this.redoButton);
		this.redoButton.click($.proxy(function(){
		    this.view.getCommandStack().redo();
		},this)).attr( "disabled", true );
		
		// buttonGroup = $('<div class="btn-group"></div>');
		// buttonBar.append(buttonGroup);

		// Inject the DELETE Button
		//
		this.deleteButton  = $("<button class='btn btn-danger btn-sm'>Delete</button>");
		buttonGroup.append(this.deleteButton);
		this.deleteButton.click($.proxy(function(){

			//TODO: changed to getSelection() from getCurrentSelection() as the latter is DEPRECATED => NOT WORKING
			var node = this.view.getCurrentSelection();
			var command= new draw2d.command.CommandDelete(node);
			this.view.getCommandStack().execute(command);
		},this)).attr("disabled", true );


    //Connection type dropdown
    buttonGroup = $('<div class="col-xs-2 btn-group"></div>');
    buttonBar.append(buttonGroup);
    connectionMenu = $('<select id="connections_menu" class="selectpicker"></select>');

    var compiledTemplate = templates["ConnectionTypeList"];
    var renderedTemplate = $(compiledTemplate.render(pstudioJSON));
    connectionMenu.append(renderedTemplate);
    buttonGroup.append(connectionMenu);		
		
		buttonBar.append("<div id='loadedFileName'></div>");
	},

	/**
	 * @method
	 * Called if the selection in the cnavas has been changed. You must register this
	 * class on the canvas to receive this event.
	 * 
	 * @param {draw2d.Figure} figure
	 */
	onSelectionChanged : function(figure){
		this.deleteButton.attr( "disabled", figure===null );
	},
	
	/**
	 * @method
	 * Sent when an event occurs on the command stack. draw2d.command.CommandStackEvent.getDetail() 
	 * can be used to identify the type of event which has occurred.
	 * 
	 * @template
	 * 
	 * @param {draw2d.command.CommandStackEvent} event
	 **/
	stackChanged:function(event)
	{
		this.undoButton.attr("disabled", !event.getStack().canUndo() );
		this.redoButton.attr("disabled", !event.getStack().canRedo() );
		
	    this.saveButton.attr("disabled",   !event.getStack().canUndo() && !event.getStack().canRedo()  );
	}
});