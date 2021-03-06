/*****************************************
 *   Library is under GPL License (GPL)
 *   Copyright (c) 2012 Andreas Herz
 ****************************************//**
 * @class draw2d.shape.composite.Raft
 * Tagging interface to determine if an figure is an composite figure
 *     
 * @author Andreas Herz
 * @extends draw2d.shape.basic.Rectangle
 * @since 4.7.2
 */
draw2d.shape.composite.Composite = draw2d.shape.basic.Rectangle.extend({
    NAME : "draw2d.shape.composite.Composite",

    /**
     * @constructor
     * Creates a new composite element which are not assigned to any canvas.
     * 
     */
    init: function( width, height) 
    {
      this._super(width, height);
      // set some good defaults
      //
      if(typeof width === "undefined"){
        this.setDimension(50, 90);
      }
      else{
        this.setDimension(width, height);
      }
    },
    
    /**
     * @method
     * Called when a user dbl clicks on the element
     * 
     * @template
     */
    onDoubleClick: function()
    {
        // do nothing per default. no rotation of the shape.
    },
    
    /**
     * @method
     * Delegate method to calculate if a figure is selectable. A composite has the right to override the 
     * initial selectable flag of the figure.
     * 
     * @param {draw2d.Figure} figure the figure to test
     * @param {Boolean} selectable the initial selectable flag of the figure
     * @returns
     * 
     */
    isMemberSelectable: function( figure, selectable)
    {
        return selectable;
    },
    
    /**
     * @method
     * Delegate method to calculate if a figure is draggable. A composite has the right to override the 
     * initial draggable flag of the figure.
     * 
     * @param {draw2d.Figure} figure the figure to test
     * @param {Boolean} draggable the initial draggable flag of the figure
     * @returns
     * 
     */
    isMemberDraggable: function( figure, draggable)
    {
        return draggable;
    },
 
    delegateSelectionHandling:function(figure)
    {
        return figure;
    },
    
    /**
     * @method
     * Set the canvas element of this figures. This can be used to determine whenever an element
     * is added or removed to the canvas.
     * 
     * @param {draw2d.Canvas} canvas the new parent of the figure or null
     */
    setCanvas: function( canvas ) 
    {
        this._super(canvas);
        
        // an composite shape goes always in the background
        //
        if(canvas!==null){
            this.toBack();
        }
    },

});
