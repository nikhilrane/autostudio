/*****************************************
 *   Library is under GPL License (GPL)
 *   Copyright (c) 2012 Andreas Herz
 ****************************************/
/**
 * @class draw2d.shape.state.Connection
 * 
 * Connection designed for a state diagram with arrow decoration at the
 * target of the connection and a label
 * 
 * See the example:
 *
 *     @example preview small frame
 *     
 *     // create and add two nodes which contains Ports (In and OUT)
 *     //
 *     var start = new draw2d.shape.state.Start();
 *     var end   = new draw2d.shape.state.End();
        
 *     // ...add it to the canvas 
 *     canvas.addFigure( start, 50,50);
 *     canvas.addFigure( end, 230,180);
 *          
 *     // Create a Connection and connect the Start and End node
 *     //
 *     var c = new draw2d.shape.state.Connection();
 *      
 *     // Connect the endpoints with the start and end port
 *     //
 *     c.setSource(start.getOutputPort(0));
 *     c.setTarget(end.getInputPort(0));
 *           
 *     // and finally add the connection to the canvas
 *     canvas.addFigure(c);
 *     
 *     
 * @extends draw2d.Connection
 */
draw2d.shape.state.Connection = draw2d.Connection.extend({

    NAME : "draw2d.shape.state.Connection",

	DEFAULT_COLOR : new draw2d.util.Color("#4D90FE"),

	init : function()
    {
        this._super();
        this.setRouter(null);

        this.setStroke(2);
        this.setTargetDecorator(new draw2d.decoration.connection.ArrowDecorator(17,8));


        this.label = new draw2d.shape.basic.Label("label");
        this.label.setStroke(1);
        this.label.setPadding(2);
        this.label.setBackgroundColor("#f0f0f0");
        this.addFigure(this.label, new draw2d.layout.locator.ParallelMidpointLocator(this));
      
    },
    /**
     * @method
     * Set the text to show if the state shape
     * 
     * @param {String} text
     */
    setLabel: function (text)
    {
        this.label.setText(text);
        
        // hide the label if no text available
        this.label.setVisible(!(text===null || text ===""));
        
        return this;
    },
    
    
    /**
     * @method
     * Return the label of the shape
     * 
     */
    getLabel: function ()
    {
        return this.label.getText();
    },
    

    /**
     * @method 
     * Return an objects with all important attributes for XML or JSON serialization
     * 
     * @returns {Object}
     */
    getPersistentAttributes : function()
    {
        var memento = this._super();

        memento.label = this.getLabel();
        
        return memento;
    },
    
    /**
     * @method 
     * Read all attributes from the serialized properties and transfer them into the shape.
     * 
     * @param {Object} memento
     * @returns 
     */
    setPersistentAttributes : function(memento)
    {
        this._super(memento);

        if(typeof memento.label !=="undefined"){
            this.setLabel(memento.label);
        }

    }

});
