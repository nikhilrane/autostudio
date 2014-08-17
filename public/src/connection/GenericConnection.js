
/**
 * @class draw2d.shape.node.Start
 * 
 * A generic Node which has an OutputPort. Mainly used for demo and examples.
 * 
 * See the example:
 *
 *     @example preview small frame
 *     
 *     var figure =  new draw2d.shape.node.Start();
 *     figure.setColor("#3d3d3d");
 *     
 *     canvas.addFigure(figure,50,10);
 *     
 * @extends draw2d.shape.basic.Rectangle
 */
example.connection.GenericConnection = draw2d.Connection.extend({

    NAME : "example.connection.GenericConnection",
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
        
        this.setGlow(true);      //TODO: Do we need this glow?
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

        // this.label = new draw2d.shape.basic.Label("label");
        // this.label.setStroke(1);
        // this.label.setPadding(2);
        // this.label.setBackgroundColor("#f0f0f0");
        // this.addFigure(this.label, new draw2d.layout.locator.PolylineMidpointLocator(this));

        this.label = new draw2d.shape.basic.Label("label1");
        this.label.setStroke(1);
        this.label.setPadding(2);
        this.label.setBackgroundColor("#f0f0f0");
        // this.label.setFontColor("#ffffff");
        this.label.setFontFamily('"Open Sans",sans-serif');
        this.label.installEditor(new draw2d.ui.LabelInplaceEditor());
        this.addFigure(this.label, new draw2d.layout.locator.PolylineMidpointLocator(this));
        
        this.parameters = $.extend(true,{},this.parameters);


        // var arrow = new draw2d.decoration.connection.DiamondDecorator(17,8);
        // this.setTargetDecorator(arrow);
            
        // this.setCssClass("AutoConnection");

        var data = { paramList:[] };
        var params = props.params;

        if(params !== undefined) {
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

                    console.log("setting: " + e.target.name + " to " + e.target.value + " for " + this.id);
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
    },


    injectPropertyView: function(domID) {
        domID.append(this.renderedPane);
//        console.log("renderedPane: \n" + JSON.stringify(this.renderedPane));
    },

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
     * Return all variables in the reqular expression group mapping
     * 
     * @return {Array}
     */
    // getVariables: function(){
    //     return draw2d.util.ArrayList.EMPTY_LIST;
    // },
    

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

        this.setUserData(userData);

        //all our userData is now set, hence call super method
        var thisFigure = this._super();
        thisFigure.label = this.label.getText();

        return thisFigure;
     }
    

});
