/*****************************************
 *   Library is under GPL License (GPL)
 *   Copyright (c) 2012 Andreas Herz
 ****************************************/
/**
 * @class draw2d.policy.figure.RegionConstraintPolicy
 * 
 * An EditPolicy for use with Figures. The constraint for RegionContraintPolicy is a Rectangle. It is
 * not possible to move the related figure outside this contrained area.
 * 
 * 
 * @author Andreas Herz
 * 
 * @extends draw2d.policy.figure.DragDropEditPolicy
 */
draw2d.policy.figure.RegionEditPolicy = draw2d.policy.figure.DragDropEditPolicy.extend({

    NAME : "draw2d.policy.figure.RegionEditPolicy",
    
    /**
     * @constructor 
     * Creates a new constraint object
     * 
     * @param {Number|draw2d.geo.Rectangle} x x coordinate or a rectangle as constraint for the assigned figure.
     * @param {Number} y
     * @param {Number} w
     * @param {Number} h
     */
    init: function( x,y,w,h){
        this._super();
        if(x instanceof draw2d.geo.Rectangle){
            this.constRect = x;
        }
        else if(typeof h === "number"){
            this.constRect = new draw2d.geo.Rectangle(x,y,w,h);
        }
        else{
            throw "Invalid parameter. RegionConstraintPolicy need a rectangle as parameter in the constructor";
        }
    },

    /**
     * @method
     * Update the constraint bounding box for the policy.
     * 
     * @param {draw2d.geo.Rectangle} boundingBox the constraint rectangle
     * @since 4.8.2
     */
    setBoundingBox: function(boundingBox){
      this.constRect = boundingBox;  
      
      return this;
    },

    /**
     * @method
     * Adjust the coordinates to the rectangle/region of this constraint.
     * 
     * @param figure
     * @param {Number|draw2d.geo.Point} x
     * @param {number} [y]
     * @returns {draw2d.geo.Point} the constraint position of the figure
     */
    adjustPosition : function(figure, x, y)
    {
        var r = null;
        if (x instanceof draw2d.geo.Point) {
            r = new draw2d.geo.Rectangle(x.x, x.y, figure.getWidth(), figure.getHeight());
        }
        else {
            r = new draw2d.geo.Rectangle(x, y, figure.getWidth(), figure.getHeight());
        }
        r = this.constRect.moveInside(r);
        return r.getTopLeft();
    },
    
    /**
     * @method
     * Adjust the dimension of the rectangle to fit ito the region of the policy
     * 
     * @param figure
     * @param w
     * @param h
     * @returns {___anonymous2210_2219}
     */
    adjustDimension : function(figure, w, h)
    {
        var diffW = (figure.getAbsoluteX()+w)-this.constRect.getRight();
        var diffH = (figure.getAbsoluteY()+h)-this.constRect.getBottom();

        if(diffW>0){
            w = w- diffW;
        }
        if(diffH>0){
            h = h- diffH;
        }
        
        return {w:w, h:h};
    }
});