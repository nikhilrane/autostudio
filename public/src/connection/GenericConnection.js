
/**
 * Models a generic connection which can be extended by connection types configured in the app's JSON file.
 * @extends draw2d.Connection
 */
autostudio.connection.GenericConnection = draw2d.Connection.extend({

    NAME : "autostudio.connection.GenericConnection",
    parameters : null,
    renderedPane: null,

	init : function(type, id)
    {
        var props = pstudioJSON[type];
        this.NAME = props.type;
        this._super();

        if(id !== null) {
            this.id = id;
        }

        this.nature = (props.nature !== undefined) ? props.nature : "";
        
        this.setGlow(true);
        if(props.color !== undefined) {
            this.setColor(props.color);
        }
        
        this.setStroke(1);

        if(props.source !== undefined) {
            this.setSourceDecorator(eval("new " + props.source));
        }

        if(props.target !== undefined) {
            this.setTargetDecorator(eval("new " + props.target));
        }

        this.label = new draw2d.shape.basic.Label("label1");
        this.label.setStroke(1);
        this.label.setPadding(2);
        this.label.setBackgroundColor("#f0f0f0");
        this.label.setFontFamily('"Open Sans",sans-serif');
        this.label.installEditor(new draw2d.ui.LabelInplaceEditor());
        this.addFigure(this.label, new draw2d.layout.locator.PolylineMidpointLocator(this));
        
        this.parameters = $.extend(true,{},this.parameters);

        var data = { paramList:[] };
        var params = props.params;

        if(params !== undefined) {
            for(var i=0; i < params.length; i++) {
                var curr = {};
                var key = Object.keys(params[i])[0];  //there is only one value in 'key' but we don't want [], hence the subscript 0.
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

            $("#property").on("change", "." + this.id, $.proxy(function(e) {
                e.preventDefault();
                // TODO: provide undo/redo here
                // app.executeCommand(new example.command.CommandSetLabel(this, paramDOM.val()));
                this.setParameter(e.target.name, e.target.value);
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

        for(var current in this.parameters) {
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
