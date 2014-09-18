/**
 * Models a generic container which can be extended by containers configured in the app's JSON file.
 * @extends draw2d.shape.composite.Raft
 */
autostudio.shape.GenericContainer = draw2d.shape.composite.Raft.extend({

    NAME : "autostudio.shape.GenericContainer",

	DEFAULT_COLOR : new draw2d.util.Color("#00B2BF"),
	parameters : null,
	renderedPane: null,



    init : function(type, id) {
          
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
      

      this.setDimension(400, 300);
      this.setGlow(true);      //TODO: Do we need this glow?
      this.setBackgroundColor(props.color);
      this.setResizeable(true);
      this.installEditPolicy(new draw2d.policy.figure.SlimSelectionFeedbackPolicy());

      this.setStroke(0);

      this.label = new draw2d.shape.basic.Label(props.label);
      this.label.setStroke(0);
      // this.label.setFontColor("#ffffff");
      this.label.setFontFamily('"Open Sans",sans-serif');
      this.label.installEditor(new draw2d.ui.LabelInplaceEditor());
      this.addFigure(this.label, new draw2d.layout.locator.TopLocator(this));

      this.parameters = $.extend(true,{},this.parameters);

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
        var renderedTemplate = $(compiledTemplate.render(data));

        $("#property").on("change", "." + this.id, $.proxy(function(e){
            e.preventDefault();
              // TODO: provide undo/redo here
              // app.executeCommand(new example.command.CommandSetLabel(this, paramDOM.val()));
              this.setParameter(e.target.name, e.target.value);

              // console.log("setting: " + e.target.name + " to " + e.target.value);
        },this));

        renderedTemplate.submit(function(e){
            return false;
        });

        this.renderedPane = renderedTemplate;
      }

    },

    /*
     * Displays properties dialog box
     */
    injectPropertyView: function(domID) {
      domID.append(this.renderedPane);
    },

    
    /*
     * Sets the parameter value for given parameter name.
     */
    setParameter: function(paramName, paramValue) {
        this.parameters[paramName] = paramValue;
     },


    /*
     * Returns the parameter value for given parameter name.
     */
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
          composites.push(figuresArray.get(i).getId());
        }

        userData.composites = composites;

        this.setUserData(userData);

        //all our userData is now set, hence call super method
        var thisFigure = this._super();
        thisFigure.label = this.label.getText();

        return thisFigure;
     }

});
