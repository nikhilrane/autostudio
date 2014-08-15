/*****************************************
 *   Library is under GPL License (GPL)
 *   Copyright (c) 2012 Andreas Herz
 ****************************************//**
 * @class draw2d.shape.composite.Group
 * A group is a figure that acts as a transparent container for other figures. A group 
 * is a StrongComposite node that controls a set of child figures. The bounding rectangle of 
 * a group is the union of the bounds of its children. Child nodes cannot be selected or 
 * manipulated individually.   
 * 
 *   
 * @author Andreas Herz
 * @extends draw2d.shape.composite.StrongComposite
 * @since 4.8.0
 */
draw2d.shape.composite.Group = draw2d.shape.composite.StrongComposite.extend({
    NAME : "draw2d.shape.composite.Group",

    /**
     * @constructor
     * Creates a new figure element which are not assigned to any canvas.
     * 
     */
    init: function( width, height) 
    {
      this._super(width, height);

      // a group is invisible
      this.setBackgroundColor( null);
      this.setColor(null);
      
      // a group isn't resizeable. The dimension is calculated by the union bounding box of all children
      this.setResizeable(false);
      
      this.stickFigures = false;
    },
    
    /**
     * @method
     * Checks whenever a figure is selectable. In case of a group a single figure
     * isn't selectable. Just a complete group can be selected.
     * 
     * @param {draw2d.Figure} figure the figure to check
     */
    delegateSelectionHandling:function(figure)
    {
        return this;
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
        return false;
    },
    
    /**
     * @method
     * Delegate method to calculate if a figure is draggable. A composite has the right to override the 
     * initial draggable flag of the figure.
     * <br>
     * Returns false because only the complete group is draggable
     * 
     * @param {draw2d.Figure} figure the figure to test
     * @param {Boolean} draggable the initial draggable flag of the figure
     * @returns
     * 
     */
    isMemberDraggable: function( figure, draggable)
    {
        return false;
    },
 
    /**
     * @method
     * Set the position of the object.
     *
     * @param {Number/draw2d.geo.Point} x The new x coordinate of the figure
     * @param {Number} [y] The new y coordinate of the figure 
     **/
    setPosition : function(x, y) 
    {
        var oldX = this.x;
        var oldY = this.y;
        
      
        this._super(x,y);
        
        var dx = this.x-oldX;
        var dy = this.y-oldY;
        
        if(dx ===0 && dy===0 ){
            return this;
        }

        if(this.stickFigures===false){
            this.assignedFigures.each($.proxy(function(i,figure){
                figure.translate(dx,dy);
            },this));
        }
        
        return this;
    },
    
    /**
     * @method
     * Assign a figure to the given group.
     * The bounding box of the group is recalculated and the union of the current bounding box with the
     * figure bounding box.
     * 
     * @param {draw2d.Figure} figure
     */
    assignFigure: function(figure)
    {
        if(!this.assignedFigures.contains(figure)){
            this.stickFigures=true;
            if(this.assignedFigures.isEmpty()===true){
                this.setBoundingBox(figure.getBoundingBox());
            }
            else{
                this.setBoundingBox(this.getBoundingBox().merge(figure.getBoundingBox()));
            }
            this.assignedFigures.add(figure);
            figure.setComposite(this);
            this.stickFigures=false;
        }
        return this;
    },
    
    /**
     * @method
     * Remove the given figure from the group assignment
     * 
     * @param {draw2d.Figure} figure the figure to remove
     * 
     */
    unassignFigure:function(figure)
    {
        if(this.assignedFigures.contains(figure)){
            this.stickFigures=true;
            figure.setComposite(null);
            this.assignedFigures.remove(figure);
            if(!this.assignedFigures.isEmpty()){
                var box = this.assignedFigures.first().getBoundingBox();
                this.assignedFigures.each(function(i,figure){
                    box.merge(figure.getBoundingBox());
                });
                this.setBoundingBox(box);
            }
            this.stickFigures=false;
        }

        return this;
    }
});






