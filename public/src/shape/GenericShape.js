
/**
 * @class draw2d.shape.node.FileSource
 * @author nikhilrane
 * A <code> file_source </code> operator which reads data from a given file and publishes the content linewise as a stream of tuples.
 * 
 * This class has been referred from src/shape/state/Start.js
 */
example.shape.GenericShape = draw2d.shape.basic.Rectangle.extend({

    NAME : "example.shape.GenericShape",

	DEFAULT_COLOR : new draw2d.util.Color("#00B2BF"),
  parameters : null,
  renderedPane: null,



     init : function(type, id) {

      var props = pstudioJSON[type];
      var ports = props.ports;
      // var params = props.params;

      this.NAME = props.type;
      
      //this call uses our 'id' field, hence we need to set it before calling this.
      this._super();

      if(id !== null) {
        this.id = id;
      }

      this.nature = (props.nature !== undefined) ? props.nature : "";

      if(ports !== undefined) {

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

          this.port.setConnectionAnchor(new draw2d.layout.anchor.ShortesPathConnectionAnchor(this.port));
        }
      }
      

      this.setDimension(120, 65);
      this.setGlow(true);      //TODO: Do we need this glow?
      this.setBackgroundColor("#6E6E6E");
      this.installEditPolicy(new draw2d.policy.figure.AntSelectionFeedbackPolicy());

      this.setStroke(0);
      this.setRadius(5);
      
      this.cloneIcon = new draw2d.shape.icon.Books();
      this.cloneIcon.setBackgroundColor('#C47C00');
      this.cloneIcon.setDimension(15,15);
      this.cloneIcon.setMinHeight(15);
      this.cloneIcon.setMinWidth(15);
      this.cloneIcon.tooltip = null;
      this.cloneIcon.onMouseEnter = function() { this.setBackgroundColor("#FFB026"); };
      this.cloneIcon.onMouseLeave = function() { this.setBackgroundColor("#C47C00"); };
      // this.cloneIcon.hideTooltip = function() { this.tooltip.remove(); this.tooltip = null; };
      // this.cloneIcon.showTooltip = function() { console.log("A"); this.tooltip= $('<div class="tooltip">Tooltip</div>').appendTo('body'); this.positionTooltip(); };
      this.cloneIcon.onClick = function() {
        this.getParent().getParent().genericClone();
      }

      // this.cloneIcon.positionTooltip = function() {
      //   if( this.tooltip===null){
      //     console.log("R");
      //       return;
      //   }
          
      //   var width =  this.tooltip.outerWidth(true);
      //   var tPosX = this.getAbsoluteX()+this.getWidth()/2-width/2+8;
      //   var tPosY = this.getAbsoluteY()+this.getHeight() + 20;
      //   this.tooltip.css({'top': tPosY, 'left': tPosX});
      //   console.log("x: " + tPosX + ", y: " + tPosY);
      // }
    
      // setPosition: function(x,y){
      //     this._super(x,y);
      //     this.positionTooltip();
      // },
    
    
      this.deleteIcon = new draw2d.shape.icon.Cross();
      this.deleteIcon.setBackgroundColor('#FF0000');
      this.deleteIcon.setDimension(15,15);
      this.deleteIcon.setMinHeight(15);
      this.deleteIcon.setMinWidth(15);
      this.deleteIcon.onMouseEnter = function() { this.setBackgroundColor("#8C0000"); };
      this.deleteIcon.onMouseLeave = function() { this.setBackgroundColor("#FF0000"); };
      this.deleteIcon.onClick = function() {
        var command= new draw2d.command.CommandDelete(this.getParent().getParent());
        app.view.getCommandStack().execute(command);
      }


      this.propertiesIcon = new draw2d.shape.icon.Gear();
      this.propertiesIcon.setBackgroundColor('#B0B0B0');
      this.propertiesIcon.setDimension(15,15);
      this.propertiesIcon.setMinHeight(15);
      this.propertiesIcon.setMinWidth(15);
      this.propertiesIcon.onMouseEnter = function() { this.setBackgroundColor("#858585"); };
      this.propertiesIcon.onMouseLeave = function() { this.setBackgroundColor("#B0B0B0"); };
      this.propertiesIcon.onClick = function() {
        this.getParent().getParent().onDoubleClick();
      }

      this.helpIcon = new draw2d.shape.icon.Talke();
      this.helpIcon.setBackgroundColor('#29A1FF');
      this.helpIcon.setDimension(15,15);
      this.helpIcon.setMinHeight(15);
      this.helpIcon.setMinWidth(15);
      this.helpIcon.onMouseEnter = function() { this.setBackgroundColor("#11F5F5"); };
      this.helpIcon.onMouseLeave = function() { this.setBackgroundColor("#29A1FF"); };
      this.helpIcon.helpText = props.helpText;
      this.helpIcon.className = props.label;
      this.helpIcon.onClick = function() {
        $('#myModalLabel').html(this.className);
        $('#myModalBody').html(this.helpText);
        $('#myModal').modal();
      }

      this.header = new draw2d.shape.layout.HorizontalLayout();
      this.header.addFigure(this.cloneIcon);
      this.header.addFigure(this.deleteIcon);
      this.header.addFigure(this.propertiesIcon);
      this.header.addFigure(this.helpIcon);
      this.header.setMinHeight(17);
      this.header.setGap(7);
      // this.header.setGlow(2);
      // this.header.setStroke(1);
      this.header.setRadius(this.getRadius());
      this.header.setBackgroundColor("#FFFFFF");

      this.label = new draw2d.shape.basic.Label(props.label);
      this.label.setStroke(0);
      this.label.setFontColor("#ffffff");
      this.label.setFontFamily('"Open Sans",sans-serif');
      this.label.installEditor(new draw2d.ui.LabelInplaceEditor());
      this.addFigure(this.label, new draw2d.layout.locator.CenterLocator(this));
      this.addFigure(this.header, new draw2d.layout.locator.TopLocator(this));
      
      this.parameters = $.extend(true,{},this.parameters);

//----------------------------------------------------------------------------------------------------

      this.generatePropertyPane(type);

      //var params = pstudioJSON.params;

    // var data = { paramList:[] };
    // data.label = this.label.getText();

    // if(params !== undefined && params.length > 0) {
    //   for(var i=0; i < params.length; i++) {
    //     var curr = {};
    //     var key = Object.keys(params[i])[0];  //there is only one value in 'key' but we don't want [], hence the subscript 0.
    //     curr.paramID = this.id;
    //     curr.paramName = key;
        
    //     if(this.getParameter(key) !== undefined && this.getParameter(key).length > 0) {
    //       curr.paramValue = this.getParameter(key);
    //     } else {
    //       curr.paramValue = params[i][key];
    //     }
        
    //     curr.active = "";
    //     data.paramList.push(curr);
    //   }

    //   data.paramList[0].active = "active";
    

    //   var compiledTemplate = templates["PropertyNav"];
    //   this.renderedHTML = compiledTemplate.render(data);
    //   var renderedTemplate = $(compiledTemplate.render(data));

    //   //TODO: Find a better event to use here!
    //   $("#modalDiv").on("change", "." + this.id, $.proxy(function(e){
    //           e.preventDefault();
    //             // TODO: provide undo/redo here
    //             // app.executeCommand(new example.command.CommandSetLabel(this, paramDOM.val()));
    //             this.setParameter(e.target.name, e.target.value);
    //       },this));

    //     renderedTemplate.submit(function(e){
    //         return false;
    //     });

    //     this.renderedPane = renderedTemplate;
    //   }

      // if(id === null) {
      //   //this means we are creating a brand new object, so generate PropertyPane
      //   this.generatePropertyPane(type);
      // }


    },

    genericClone: function(){
      // console.log("in clone");
        var cloned = eval(new example.shape.GenericShape(pstudioJSON[this.NAME].type, null));
        var initialId = cloned.id;

        cloned.setPersistentAttributes( this.getPersistentAttributes());
        cloned.id = initialId;

        var command = new draw2d.command.CommandAdd(app.getView(), cloned, this.getAbsoluteX() + 50, this.getAbsoluteY() + 50);
        app.getView().getCommandStack().execute(command);
        // return cloned;
    },

    // onDragEnter: function(draggedFigure) {
    //   this._super(draggedFigure);
    //   console.log("Drag enter(shape.js): " + draggedFigure.NAME);
    //   return this;
    // },

    injectPropertyView: function(domID) {
      // domID.append(this.renderedPane);

      // $("#appendHere").html(this.renderedHTML);
      // $('#newModal').modal();
      // console.log("this: " + $("#newModal").html());
//        console.log("renderedPane: \n" + JSON.stringify(this.renderedPane));
    },

    generatePropertyPane: function(type) {

      var templateName = pstudioJSON[type].templateName;
      var params = pstudioJSON[type].params;
      var data = { paramList:[] };
      data.label = this.label.getText();      

      if(params !== undefined && params.length > 0) {
        for(var i=0; i < params.length; i++) {
          var curr = {};
          var key = Object.keys(params[i])[0];  //there is only one value in 'key' but we don't want [], hence the subscript 0.
          // curr.paramID = key + "Parameter";
          curr.paramID = this.id + "_" + key;
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
        data.shapeID = this.id;
      
        var compiledTemplate = null;

        if(templateName === undefined) {
          compiledTemplate = templates["PropertyNav"];
        } else {
          compiledTemplate = templates[templateName];
        }
        
        // console.log("data: " + JSON.stringify(data));
        // console.log("\n\nrendered: \n" + compiledTemplate.render(data));
        var renderedTemplate = $(compiledTemplate.render(data));

        renderedTemplate.submit(function(e){
            return false;
        });

        // If we are using the default template, attach a listener for updating parameter values from UI
        // Else it is the template's responsibility to use the API => app.updateFigureParameter(<param_name>, <param_value>)
        if(templateName === undefined) {
          //TODO: Find a better event to use here!
          $("#modalDiv").on("change", "." + this.id, $.proxy(function(e){
              e.preventDefault();
                // TODO: provide undo/redo here
                // app.executeCommand(new example.command.CommandSetLabel(this, paramDOM.val()));
                this.setParameter(e.target.name, e.target.value);
          },this));
        }

        this.renderedPane = renderedTemplate;
      }

      
    },


     onDoubleClick: function() {
        $("#modalDiv").html("");
        this.generatePropertyPane(this.NAME);
        $("#modalDiv").append(this.renderedPane);
        $('#propertiesModal').modal();    //this div comes from pre-compiled template
      },

     setParameter: function(paramName, paramValue) {
//        var temp = {};
//        temp[paramName] = paramValue;
        this.parameters[paramName] = paramValue;
        console.log("setting for " + this.id + ": " + paramName + " : " + paramValue + "\n all: " + JSON.stringify(this.parameters));
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
            console.log("in set: " + key + " <=> " + current[key]);
            this.parameters[key] = current[key];
            
            // this.renderedPane.find("#" + this.id + "_" + key).val(current[key]);
          }
        }

        this.setUserData(null);   //this ensures we don't mess up later if we already have some data

        //this method is only called from example.Reader, hence no condition in below line
        this.generatePropertyPane(element.type);
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
          console.log("c in get: " + JSON.stringify(current) + ", value: " + this.parameters[current]);
          var temp = {};
          temp[current] = this.parameters[current];
          userData.parameters.push(temp);
        }

        this.setUserData(userData);

        //all our userData is now set, hence call super method
        var thisFigure = this._super();
        thisFigure.label = this.label.getText();

        return thisFigure;
     }

});
