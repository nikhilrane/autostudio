
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
        
        // this._super(element);
        // this.withParameter = element.parameters[0].withParameter;
        // this.usingParameter = element.parameters[1].usingParameter;
        // this.commentParameter = element.parameters[2].commentParameter;

        this._super(element);

         // console.log("in set, setting: " + JSON.stringify(element.parameters));

        // this.parameters = element.parameters;

        this.label.setText(element.label);

        for(var i=0; i < element.parameters.length; i++){
          var current = element.parameters[i];
          var key = Object.keys(current)[0];
          this.parameters[key] = current[key];
          
          this.renderedPane.find("#" + this.id + "_" + key).val(current[key]);
          // console.log("Finding: " + this.id + "_" + key);
        }


             // console.log("this.parameters: " + JSON.stringify(this.parameters));

     },


     /**
       * @method
       * Returns an array of parameters stored in <code> this </code> operator.
       *
       */
     getPersistentAttributes: function()
     {
        
        // var thisFigure = this._super();
        // thisFigure.parameters = [];
        // thisFigure.parameters.push( {"withParameter" : this.withParameter}, {"usingParameter" : this.usingParameter} );
        // thisFigure.parameters.push( {"commentParameter" : this.commentParameter} );

        // return thisFigure;

        var thisFigure = this._super();
        // thisFigure.parameters = [];
        // thisFigure.parameters.push( {"withParameter" : this.withParameter}, {"usingParameter" : this.usingParameter} );
        // thisFigure.parameters.push( {"commentParameter" : this.commentParameter} );

        thisFigure.label = this.label.getText();
        thisFigure.parameters = [];

        for(var current in this.parameters){
          console.log("c in get: " + JSON.stringify(current));
          var temp = {};
          temp[current] = this.parameters[current];
          thisFigure.parameters.push(temp);
        }


        // thisFigure.parameters = this.parameters;
        // thisFigure.parameters.push(this.parameters);

        // console.log("in get, final: " + JSON.stringify(thisFigure.parameters));
        // var temp = this.getPorts();
        return thisFigure;
     }
    

});
