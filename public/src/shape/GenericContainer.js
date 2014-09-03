
/**
 * @class draw2d.shape.node.FileSource
 * @author nikhilrane
 * A <code> file_source </code> operator which reads data from a given file and publishes the content linewise as a stream of tuples.
 * 
 * This class has been referred from src/shape/state/Start.js
 */
example.shape.GenericContainer = draw2d.shape.composite.Raft.extend({

    NAME : "example.shape.GenericContainer",

	DEFAULT_COLOR : new draw2d.util.Color("#00B2BF"),
	parameters : null,
	renderedPane: null,



     init : function(type, id)
        {
            /*
            {
              "color" : "#00B2BF",
              "ports" : [
                {"type" : "output", "location" : "bottom"}
              ],
              "label" : "NewOp",
              "params" : [
                { "with" : "" },
                { "using" : "" },
                { "comment" : "" }
              ]
            }
            */

            // var that = this;   //TODO: check if this 'that' has some significance
            // this._super();
            
            var props = pstudioJSON[type];
            var ports = props.ports;
            var params = props.params;

            this.NAME = props.type;
            
            //this call uses our 'id' field, hence we need to set it before calling this.
            this._super();

            if(id !== null) {
              this.id = id;
            }

            this.nature = (props.nature !== undefined) ? props.nature : "";

            if(ports !== undefined && ports.length > 0) {

              for(var i=0; i < ports.length; i++) { 
                //TODO: Location is hardcoded here!!!
                switch(ports[i].type) {
                  case "input" : this.port = this.createPort(ports[i].type, new draw2d.layout.locator.InputPortLocator(this));
                            break;

                  case "output" : this.port = this.createPort(ports[i].type, new draw2d.layout.locator.OutputPortLocator(this));
                            break;

                  // If we don't find some place, blindly put it at bottom
                  default : this.port = this.createPort(ports[i].type, new draw2d.layout.locator.BottomLocator(this));
                            break;

                }

                this.port.setConnectionAnchor(new draw2d.layout.anchor.CenterEdgeConnectionAnchor(this.port));
              }
            }
            

            this.setDimension(300, 200);
            this.setGlow(true);      //TODO: Do we need this glow?
            this.setBackgroundColor(props.color);
            this.setResizeable(true);
            this.installEditPolicy(new draw2d.policy.figure.SlimSelectionFeedbackPolicy());

            this.setStroke(0);

            // var circle = new draw2d.shape.basic.Circle();
            // circle.setDimension(60,60);
            // circle.setBackgroundColor(props.color);
            // circle.setStroke(0);
            // this.addFigure(circle, new draw2d.layout.locator.CenterLocator(this));           

            // var pageIcon = new draw2d.shape.icon.Page();
            // pageIcon.setDimension(50,50);
            // pageIcon.setStroke(0);
            // this.addFigure(pageIcon, new draw2d.layout.locator.CenterLocator(this));

            // console.log("Label: " + JSON.stringify(props.label));
            this.label = new draw2d.shape.basic.Label(props.label);
            this.label.setStroke(0);
            // this.label.setFontColor("#ffffff");
            this.label.setFontFamily('"Open Sans",sans-serif');
            this.label.installEditor(new draw2d.ui.LabelInplaceEditor());
            this.addFigure(this.label, new draw2d.layout.locator.TopLocator(this));
            // this.labelObject = label;

        //     this.label = new draw2d.shape.basic.Label("label1");
        // this.label.setStroke(1);
        // this.label.setPadding(2);
        // this.label.setBackgroundColor("#f0f0f0");
        // // this.label.setFontColor("#ffffff");
        // this.label.setFontFamily('"Open Sans",sans-serif');
        // this.label.installEditor(new draw2d.ui.LabelInplaceEditor());
        // this.addFigure(this.label, new draw2d.layout.locator.PolylineMidpointLocator(this));

	    this.parameters = $.extend(true,{},this.parameters);
            //set params
            // if(params !== undefined) {

  //             for(var j=0; j < params.length; j++) {
  //               var current = params[j];
		//  // console.log("Params: " + JSON.stringify(current));
		// key = Object.keys(current)[0];
  //               this.parameters[key] = current[key];      //push all parameters
  //             }
  //           }
	    
	 //     console.log("Final params: " + JSON.stringify(this.parameters));

//----------------------------------------------------------------------------------------------------
      //var params = pstudioJSON.params;

    var data = { paramList:[] };

    if(params !== undefined && params.length > 0) {
      for(var i=0; i < params.length; i++) {
        var curr = {};
        var key = Object.keys(params[i])[0];  //there is only one value in 'key' but we don't want [], hence the subscript 0.
        // curr.paramID = key + "Parameter";
        curr.paramID = this.id;
        curr.paramName = key;
        
        if(this.getParameter(key) !== undefined && this.getParameter(key).length > 0) {
          curr.paramValue = this.getParameter(key);
        } else {
          curr.paramValue = params[i][key];
        }
        
        curr.active = "";

        data.paramList.push(curr);
      }

      data.paramList[0].active = "active";
    

      var compiledTemplate = templates["PropertyNav"];
     // console.log("type: " + this.NAME + "\nr: " + compiledTemplate.render(data) + "\n\n");
      var renderedTemplate = $(compiledTemplate.render(data));
      // console.log("this.id: " + this.id);

      //TODO: Find a better event to use here!
      $("#property").on("change", "." + this.id, $.proxy(function(e){
              e.preventDefault();
                // TODO: provide undo/redo here
                // app.executeCommand(new example.command.CommandSetLabel(this, paramDOM.val()));
                this.setParameter(e.target.name, e.target.value);

                // console.log("setting: " + e.target.name + " to " + e.target.value);
          },this));

     //  // console.log("data length: " + data.paramList.length);
     //  // console.log("data: " + JSON.stringify(data));

     //  for(var j=1; j < data.paramList.length; j++) {    //j=1 because 0 is label and we explicitly set it always
     //    var id = data.paramList[j].paramID;
     //    // console.log("name: " + id + ", val: " + val);
     //    var paramDOM = "";
     //    var paramDOMHandler = "";

     //    paramDOM = renderedTemplate.find("#" + id);
     //      paramDOMHandler = $.proxy(function(e){
     //          e.preventDefault();
     //            // TODO: provide undo/redo here
     //            // app.executeCommand(new example.command.CommandSetLabel(this, paramDOM.val()));
     //            this.setParameter(e.target.name, e.target.value);

     //            // console.log("j: " + j);
     //            // console.log("data: " + JSON.stringify(data));
     //             console.log("setting: " + e.target.name + " to " + e.target.value);
     //      },this);
     //      paramDOM.change(paramDOMHandler);

     //  }


     //    var fsName = renderedTemplate.find("#" + data.paramList[0].paramID);
     //    var fsNameHandler = $.proxy(function(e){
     //        e.preventDefault();
     //          // provide undo/redo for the label field
     //          app.executeCommand(new example.command.CommandSetLabel(this, fsName.val()));
     //          // alert("Changed label");
     //    },this);
     //    fsName.change(fsNameHandler);



        renderedTemplate.submit(function(e){
            return false;
        });

        this.renderedPane = renderedTemplate;
      }
      
      // domId.append(renderedTemplate);
      
      // console.log("this" + JSON.stringify(this.toString()));

    },

    // onCatch: function(droppedFigure, x, y, shiftKey, ctrlKey) {
    // 	this._super(droppedFigure, x, y, shiftKey, ctrlKey);

    // 	console.log("dropped (container.js): " + droppedFigure.NAME);
    // },

    // onDragEnter: function(draggedFigure) {
    // 	this._super(draggedFigure);
    // 	console.log("Drag enter(container.js): " + draggedFigure.NAME);
    // },

      injectPropertyView: function(domID) {
        domID.append(this.renderedPane);
//        console.log("renderedPane: \n" + JSON.stringify(this.renderedPane));
      },

    
     /**
       * @method
       * Set the label of file_source() operator.
       *
       * @param {String} labelName
       */
     // setLabel: function(labelName)
     // {
     //    this.labelObject.setText(labelName);

     //    return this;
     // },

     /**
       * @method
       * Returns the label of file_source() operator.
       *
       */
     // getLabel: function()
     // {
     //    return this.labelObject.getText();
     // },

     setParameter: function(paramName, paramValue) {
//        var temp = {};
//        temp[paramName] = paramValue;
        this.parameters[paramName] = paramValue;
        console.log("setting: " + paramName + " : " + paramValue + "\n all: " + JSON.stringify(this.parameters));
     },

     getParameter: function(paramName) {
        return this.parameters[paramName];
     },


     /**
       * @method
       * Sets parameters of <code> this </code> operator from JSON element.
       *
       */
     setPersistentAttributes: function(element)
     {
        
        this._super(element);

        this.label.setText(element.label);

        var userData = this.getUserData();      //userData is set by our Reader by default
        this.nature = userData.nature;

        if(userData.parameters !== undefined) {
          for(var i=0; i < userData.parameters.length; i++){
            var current = userData.parameters[i];
            var key = Object.keys(current)[0];
            this.parameters[key] = current[key];
            
            this.renderedPane.find("#" + this.id + "_" + key).val(current[key]);
          }
        }

        this.setUserData(null);   //this ensures we don't mess up later if we already have some data
     },


     /**
       * @method
       * Returns an array of parameters stored in <code> this </code> operator.
       *
       */
     getPersistentAttributes: function()
     {
        
        var userData = {};
        userData.parameters = [];
        userData.nature = this.nature;

        for(var current in this.parameters){
          console.log("c in get: " + JSON.stringify(current));
          var temp = {};
          temp[current] = this.parameters[current];
          userData.parameters.push(temp);
        }


        var composites = [];

        var figuresArray = this.getAboardFigures(true);
        for(var i=0; i < figuresArray.getSize(); i++) {
          // var figure = figuresArray.get(i);
          // console.log("F: " + figuresArray.get(i).getId);

          composites.push(figuresArray.get(i).getId());
        }

        // console.log("composites: " + JSON.stringify(composites) + ", length: " + figuresArray.getSize());

        userData.composites = composites;

        this.setUserData(userData);

        //all our userData is now set, hence call super method
        var thisFigure = this._super();
        thisFigure.label = this.label.getText();



        return thisFigure;
     }

});
