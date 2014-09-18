

autostudio.View = draw2d.Canvas.extend({
	
	init:function(id){
		this._super(id);
		
		this.setScrollArea("#"+id);
		this.installEditPolicy(new draw2d.policy.canvas.SnapToGeometryEditPolicy());
        this.gridPolicy = false;
		this.currentDropConnection = null;
		
		// override the defualt keyUp method to avoid "delete" of elements via ENTF key
		this.onKeyDown= function(){};
	},

    /**
     * @method
     * Called if the DragDrop object is moving around.<br>
     * <br>
     * Graphiti use the jQuery draggable/droppable lib. Please inspect
     * http://jqueryui.com/demos/droppable/ for further information.
     * 
     * @param {HTMLElement} droppedDomNode The dragged DOM element.
     * @param {Number} x the x coordinate of the drag
     * @param {Number} y the y coordinate of the drag
     * 
     * @template
     **/
    onDrag:function(droppedDomNode, x, y )
    {
    },
    
    /**
     * @method
     * Called if the user drop the droppedDomNode onto the canvas.<br>
     * <br>
     * Draw2D use the jQuery draggable/droppable lib. Please inspect
     * http://jqueryui.com/demos/droppable/ for further information.
     * 
     * @param {HTMLElement} droppedDomNode The dropped DOM element.
     * @param {Number} x the x coordinate of the drop
     * @param {Number} y the y coordinate of the drop
     * @param {Boolean} shiftKey true if the shift key has been pressed during this event
     * @param {Boolean} ctrlKey true if the ctrl key has been pressed during the event
     * @private
     **/
    onDrop : function(droppedDomNode, x, y, shiftKey, ctrlKey)
    {
        var type = $(droppedDomNode).data("shape");
        var nature = pstudioJSON[type].nature;
        var figure = null;
        if(nature === "container") {
            figure = eval(new autostudio.shape.GenericContainer(type, null));
        } else {
            figure = eval(new autostudio.shape.GenericShape(type, null));
        }
        
        // create a command for the undo/redo support
        var command = new draw2d.command.CommandAdd(this, figure, x, y);
        this.getCommandStack().execute(command);
    }
});

